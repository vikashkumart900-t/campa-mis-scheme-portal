import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography
} from "@mui/material";
import { SuccessModal } from "../../components/ui";
import BasicInfoStep from "../../features/scheme-proposal/steps/BasicInfoStep";
import ObjectivesFundingStep from "../../features/scheme-proposal/steps/ObjectivesFundingStep";
import DeliverablesStep from "../../features/scheme-proposal/steps/DeliverablesStep";
import EvaluationResearchStep from "../../features/scheme-proposal/steps/EvaluationResearchStep";
import DocumentsEmploymentStep from "../../features/scheme-proposal/steps/DocumentsEmploymentStep";
import TechExitDeclarationStep from "../../features/scheme-proposal/steps/TechExitDeclarationStep";
import InstallmentStep from "../../features/scheme-proposal/steps/InstallmentStep";
import ReviewSubmissionStep from "../../features/scheme-proposal/steps/ReviewSubmissionStep";
import { proposalSteps } from "../../features/scheme-proposal/config/proposalSteps";
import { apiUrls } from "../../api/urls";

const laterStepComponents = [
  ObjectivesFundingStep,
  DeliverablesStep,
  EvaluationResearchStep,
  DocumentsEmploymentStep,
  TechExitDeclarationStep,
  InstallmentStep,
  ReviewSubmissionStep
];

function SchemeProposalWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const schemeId = searchParams.get("schemeId");
  const scope = searchParams.get("scope");
  const [activeStep, setActiveStep] = useState(0);
  const [savedStepIndex, setSavedStepIndex] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [savingReviewSubmission, setSavingReviewSubmission] = useState(false);
  const [reviewSubmissionError, setReviewSubmissionError] = useState("");
  const formMethods = useForm({
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      reviewSubmission: { username: "" },
      signatureFile: null,
      supportingDocument: null,
      objectivesFunding: {
        objectives: [],
        hasStateComponents: "",
        stateBoardAgreement: "",
        hasOtherFundingAgency: ""
      },
      deliverables: {
        items: [
          {
            description: "",
            unit: "",
            initiationDate: "",
            closingDate: "",
            financialOutlay: "",
            remarks: "",
            attachment: null
          }
        ],
        expenditureType: "",
        yearWiseExpenditures: [],
        nationalImportance: [{ description: "" }],
        internationalFootprints: [{ description: "" }]
      },
      evaluationResearch: {
        monitoringAnnually: "",
        monitoringAnnuallyItems: [{ details: "", attachment: null }],
        midtermEvaluation: "",
        midtermEvaluationItems: [{ details: "", attachment: null }],
        researchAspects: "",
        researchHighlights: ""
      },
      documentsEmployment: {
        capacityProgramDetails: "",
        kmlFiles: [{ description: "", file: null }],
        imageGallery: [{ description: "", files: null }],
        selectedFinancialYear: "",
        employmentRows: []
      },
      techExitDeclaration: {
        technologyIntervention: "",
        technologyDocument: null,
        exitProtocol: "",
        exitProtocolDocument: null,
        declaration1: false,
        declaration2: false
      },
      installment: {
        installments: [],
        bankDetails: {
          accountName: "",
          bankName: "",
          ifscCode: "",
          branchNameAddress: "",
          accountNumber: "",
          confirmAccountNumber: ""
        }
      },
      schemeName: "",
      organizationName: "",
      stateDistrictSelections: [
        { stateCode: "", stateName: "", districtIds: [], districtCodes: [], districtNames: [] }
      ],
      officerName: "",
      designation: "",
      email: "",
      mobile: "",
      aadhaarNumber: "",
      dateOfProposal: "",
      expectedCompletionDate: "",
      proposedFinancialOutlay: "",
      schemeDuration: ""
    }
  });
  const { getValues, setValue, setError, clearErrors, trigger } = formMethods;
  const ActiveStepForm = activeStep > 0 ? laterStepComponents[activeStep - 1] : null;
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);
  const [basicInfoError, setBasicInfoError] = useState("");
  const [savingObjectivesFunding, setSavingObjectivesFunding] = useState(false);
  const [objectivesFundingError, setObjectivesFundingError] = useState("");
  const [savingDeliverables, setSavingDeliverables] = useState(false);
  const [deliverablesError, setDeliverablesError] = useState("");
  const [savingEvaluationResearch, setSavingEvaluationResearch] = useState(false);
  const [evaluationResearchError, setEvaluationResearchError] = useState("");
  const [savingDocumentsEmployment, setSavingDocumentsEmployment] = useState(false);
  const [documentsEmploymentError, setDocumentsEmploymentError] = useState("");
  const [savingTechExitDeclaration, setSavingTechExitDeclaration] = useState(false);
  const [techExitDeclarationError, setTechExitDeclarationError] = useState("");
  const [savingInstallment, setSavingInstallment] = useState(false);
  const [installmentError, setInstallmentError] = useState("");
  const [loadedSchemeId, setLoadedSchemeId] = useState(null);
  const [schemeSubmissionIds, setSchemeSubmissionIds] = useState(null);
  const [schemeNameError, setSchemeNameError] = useState("");
  const schemeNameLoading = Boolean(schemeId && schemeId !== loadedSchemeId);

  useEffect(() => {
    if (!schemeId) return undefined;

    const controller = new AbortController();

    fetch(apiUrls.schemeDetails(schemeId), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        const details = await response.json();
        if (!details || typeof details !== "object" || Array.isArray(details)) {
          throw new Error("The scheme details API returned unexpected data.");
        }
        if (typeof details.schemeName !== "string" || !details.schemeName.trim()) {
          throw new Error("The selected scheme details did not include a scheme name.");
        }
        if (typeof details.organizationName !== "string" || !details.organizationName.trim()) {
          throw new Error("The selected scheme details did not include an organization name.");
        }
        const submissionIds = {
          organizationId: Number(details.organizationId),
          divisionId: Number(details.divisionId ?? details.programDivisionId),
          schemeId: Number(schemeId)
        };
        if (Object.values(submissionIds).some((id) => !Number.isSafeInteger(id) || id <= 0)) {
          throw new Error("The selected scheme details did not include valid organization, division, and scheme IDs.");
        }
        setValue("schemeName", details.schemeName.trim(), { shouldValidate: true });
        setValue("organizationName", details.organizationName.trim(), { shouldValidate: true });
        setSchemeSubmissionIds(submissionIds);
        setSchemeNameError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSchemeNameError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadedSchemeId(schemeId);
        }
      });

    return () => controller.abort();
  }, [schemeId, setValue]);

  const validateCurrentStep = async () => {
    if (proposalSteps[activeStep].id === "evaluationResearch") {
      const evaluationResearch = getValues("evaluationResearch") || {};
      const monitoringFields = evaluationResearch.monitoringAnnually === "yes"
        ? (evaluationResearch.monitoringAnnuallyItems || []).flatMap((_, index) => [
          `evaluationResearch.monitoringAnnuallyItems.${index}.details`,
          `evaluationResearch.monitoringAnnuallyItems.${index}.attachment`
        ])
        : [];
      const midtermFields = evaluationResearch.midtermEvaluation === "yes"
        ? (evaluationResearch.midtermEvaluationItems || []).flatMap((_, index) => [
          `evaluationResearch.midtermEvaluationItems.${index}.details`,
          `evaluationResearch.midtermEvaluationItems.${index}.attachment`
        ])
        : [];
      return trigger([...proposalSteps[activeStep].fields, ...monitoringFields, ...midtermFields]);
    }

    if (proposalSteps[activeStep].id === "deliverables") {
      const deliverables = getValues("deliverables") || {};
      const itemFields = (deliverables.items || []).flatMap((_, index) => [
        `deliverables.items.${index}.description`,
        `deliverables.items.${index}.unit`,
        `deliverables.items.${index}.initiationDate`,
        `deliverables.items.${index}.closingDate`,
        `deliverables.items.${index}.financialOutlay`
      ]);
      const nationalFields = (deliverables.nationalImportance || []).map(
        (_, index) => `deliverables.nationalImportance.${index}.description`
      );
      const internationalFields = (deliverables.internationalFootprints || []).map(
        (_, index) => `deliverables.internationalFootprints.${index}.description`
      );
      const yearlyExpenditureFields = deliverables.expenditureType === "yearWise"
        ? (deliverables.yearWiseExpenditures || []).map((_, index) => `deliverables.yearWiseExpenditures.${index}.expenditure`)
        : [];
      return trigger([
        "deliverables.expenditureType",
        ...itemFields,
        ...nationalFields,
        ...internationalFields,
        ...yearlyExpenditureFields
      ]);
    }

    if (proposalSteps[activeStep].id === "documentsEmployment") {
      const documentsEmployment = getValues("documentsEmployment") || {};
      const kmlFields = (documentsEmployment.kmlFiles || []).flatMap((_, index) => [
        `documentsEmployment.kmlFiles.${index}.description`,
        `documentsEmployment.kmlFiles.${index}.file`
      ]);
      const imageGalleryFields = (documentsEmployment.imageGallery || []).flatMap((_, index) => [
        `documentsEmployment.imageGallery.${index}.description`,
        `documentsEmployment.imageGallery.${index}.files`
      ]);
      const employmentFields = (documentsEmployment.employmentRows || []).flatMap((_, index) => [
        `documentsEmployment.employmentRows.${index}.laborCost`,
        `documentsEmployment.employmentRows.${index}.mandays`,
        `documentsEmployment.employmentRows.${index}.tribals`,
        `documentsEmployment.employmentRows.${index}.forestDwellers`
      ]);
      if (!documentsEmployment.employmentRows?.length) {
        setError("documentsEmployment.employmentRows", {
          type: "required",
          message: "Add at least one financial year."
        });
        return false;
      }
      clearErrors("documentsEmployment.employmentRows");
      return trigger([
        ...proposalSteps[activeStep].fields,
        ...kmlFields,
        ...imageGalleryFields,
        ...employmentFields
      ]);
    }

    if (proposalSteps[activeStep].id === "installment") {
      const installments = getValues("installment.installments") || [];
      if (!installments.length) {
        setError("installment.installments", {
          type: "required",
          message: "Enter the proposal and expected completion dates to generate installment years."
        });
        return false;
      }
      clearErrors("installment.installments");
      return trigger([
        ...installments.flatMap((_, index) => [
          `installment.installments.${index}.duration`,
          `installment.installments.${index}.amount`
        ]),
        "installment.bankDetails.accountName",
        "installment.bankDetails.bankName",
        "installment.bankDetails.ifscCode",
        "installment.bankDetails.branchNameAddress",
        "installment.bankDetails.accountNumber",
        "installment.bankDetails.confirmAccountNumber"
      ]);
    }

    const fields = proposalSteps[activeStep].fields;
    return fields.length === 0 || trigger(fields);
  };

  const goToNextStep = async () => {
    if (activeStep === 0 || ["objectivesFunding", "deliverables", "evaluationResearch", "techExitDeclaration"].includes(proposalSteps[activeStep].id)) {
      await saveAndGoToNextStep();
      return;
    }
    if (!(await validateCurrentStep())) return;
    setActiveStep((currentStep) => Math.min(currentStep + 1, proposalSteps.length - 1));
  };

  const saveAndGoToNextStep = async (event) => {
    if (event) event.preventDefault();
    if (!(await validateCurrentStep())) return;

    if (activeStep === 0) {
      setSavingBasicInfo(true);
      setBasicInfoError("");
      try {
        const values = getValues();
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }
        if (!schemeSubmissionIds || schemeSubmissionIds.schemeId !== Number(schemeId)) {
          throw new Error("The selected scheme is missing organization, division, or scheme IDs. Select the scheme again.");
        }
        const payload = {
          schemeName: values.schemeName.trim(),
          organizationName: values.organizationName.trim(),
          officerName: values.officerName.trim(),
          designation: values.designation.trim(),
          email: values.email.trim(),
          mobile: values.mobile.trim(),
          aadhaarNumber: values.aadhaarNumber.trim(),
          schemeDuration: values.schemeDuration.trim(),
          proposedFinancialOutlay: values.proposedFinancialOutlay,
          dateOfProposal: values.dateOfProposal,
          expectedCompletionDate: values.expectedCompletionDate,
          organizationId: schemeSubmissionIds.organizationId,
          divisionId: schemeSubmissionIds.divisionId,
          schemeId: schemeSubmissionIds.schemeId,
          stateDistricts: (values.stateDistrictSelections || [])
            .filter((selection) => selection?.stateCode)
            .map((selection) => ({
              stateCode: String(selection.stateCode),
              districtCodes: (selection.districtCodes || []).map(String)
            }))
        };
        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.nodalOfficer, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          body: JSON.stringify(payload)
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setBasicInfoError(`Unable to save nodal officer details: ${error.message}`);
        return;
      } finally {
        setSavingBasicInfo(false);
      }
    } else if (proposalSteps[activeStep].id === "objectivesFunding") {
      setSavingObjectivesFunding(true);
      setObjectivesFundingError("");
      try {
        const values = getValues().objectivesFunding || {};
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }
        const stateAgreementFile = values.stateAgreementDocument?.[0];
        const fundingDocumentFile = values.otherFundingAgencyDocument?.[0];
        if (!stateAgreementFile || !fundingDocumentFile) {
          throw new Error("Upload both the state agreement and funding agency documents.");
        }
        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const payload = {
          objectives: {
            majorObjectives: (values.objectives || []).map((objective) => ({
              majorObjective: (objective.majorObjective || "").trim(),
              minorObjectives: (objective.minorObjectives || [])
                .map((minorObjective) => (minorObjective.minorObjective || "").trim())
            }))
          },
          stateFunding: {
            hasStateComponents: values.hasStateComponents === "yes",
            stateOnboard: values.stateBoardAgreement === "yes",
            stateAgreementFileName: stateAgreementFile.name,
            stateAgreementFilePath: null,
            hasOtherFundingAgency: values.hasOtherFundingAgency === "yes",
            otherFundingSources: (values.otherFundingSources || "").trim(),
            fundingDocumentFileName: fundingDocumentFile.name,
            fundingDocumentFilePath: null
          }
        };
        const formData = new FormData();
        formData.append("request", JSON.stringify(payload));
        formData.append("stateAgreementFile", stateAgreementFile);
        formData.append("fundingDocumentFile", fundingDocumentFile);
        const response = await fetch(apiUrls.misObjectives(selectedSchemeId), {
          method: "POST",
          headers: {
            Authorization: authorization
          },
          body: formData
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setObjectivesFundingError(`Unable to save objectives and funding: ${error.message}`);
        return;
      } finally {
        setSavingObjectivesFunding(false);
      }
    } else if (proposalSteps[activeStep].id === "deliverables") {
      setSavingDeliverables(true);
      setDeliverablesError("");
      try {
        const values = getValues().deliverables || {};
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }
        const expenditureType = values.expenditureType === "activityWise" ? "ACTIVITY_WISE" : "YEAR_WISE";
        const payload = {
          expenditureType,
          deliverables: (values.items || []).map((item) => ({
            id: item.id ?? null,
            deliverable: item.description.trim(),
            unit: item.unit.trim(),
            initiationDate: item.initiationDate,
            closingDate: item.closingDate,
            financialOutlay: Number(item.financialOutlay),
            remarks: (item.remarks || "").trim()
          })),
          yearlyExpenditures: expenditureType === "YEAR_WISE"
            ? (values.yearWiseExpenditures || []).map((row) => ({
              financialYear: row.financialYear,
              expenditure: Number(row.expenditure)
            }))
            : [],
          nationalImportance: (values.nationalImportance || []).map((item) => item.description.trim()),
          internationalFootprints: (values.internationalFootprints || []).map((item) => item.description.trim())
        };
        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.misDeliverables(selectedSchemeId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          body: JSON.stringify(payload)
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setDeliverablesError(`Unable to save deliverables: ${error.message}`);
        return;
      } finally {
        setSavingDeliverables(false);
      }
    } else if (proposalSteps[activeStep].id === "evaluationResearch") {
      setSavingEvaluationResearch(true);
      setEvaluationResearchError("");
      try {
        const values = getValues().evaluationResearch || {};
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }

        let evaluationType;
        let selectedRows = [];
        if (values.monitoringAnnually === "yes") {
          evaluationType = "ANNUAL";
          selectedRows = values.monitoringAnnuallyItems || [];
        } else if (values.midtermEvaluation === "yes") {
          evaluationType = "MIDTERM";
          selectedRows = values.midtermEvaluationItems || [];
        } else {
          throw new Error("Select an evaluation commitment.");
        }

        const evaluationDetails = selectedRows
          .map((row) => (row.details || "").trim())
          .filter(Boolean);
        const supportingDocument = selectedRows[0]?.attachment?.[0];
        if (!evaluationDetails.length) {
          throw new Error("Enter at least one evaluation detail.");
        }
        if (!supportingDocument) {
          throw new Error("Upload a supporting document.");
        }

        const payload = {
          evaluationType,
          evaluationDetails,
          researchAspects: (values.researchAspects || "").trim(),
          uniqueHighlights: (values.researchHighlights || "").trim()
        };
        const formData = new FormData();
        formData.append("request", JSON.stringify(payload));
        formData.append("file", supportingDocument);

        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.misEvaluationResearch(selectedSchemeId), {
          method: "POST",
          headers: {
            Authorization: authorization
          },
          body: formData
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setEvaluationResearchError(`Unable to save evaluation and research: ${error.message}`);
        return;
      } finally {
        setSavingEvaluationResearch(false);
      }
    } else if (proposalSteps[activeStep].id === "documentsEmployment") {
      setSavingDocumentsEmployment(true);
      setDocumentsEmploymentError("");
      try {
        const values = getValues().documentsEmployment || {};
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }

        const kmlFiles = values.kmlFiles || [];
        const imageGallery = values.imageGallery || [];
        const payload = {
          capacityBuildingDetails: (values.capacityProgramDetails || "").trim(),
          documents: [
            ...kmlFiles.map((document) => ({
              documentType: "KML",
              description: (document.description || "").trim()
            })),
            ...imageGallery.map((image) => ({
              documentType: "IMAGE",
              description: (image.description || "").trim()
            }))
          ],
          employmentDetails: (values.employmentRows || []).map((row) => ({
            financialYear: row.financialYear,
            labourCost: Number(row.laborCost),
            mandaysGenerated: Number(row.mandays),
            tribals: Number(row.tribals),
            forestDwellersBenefitted: Number(row.forestDwellers)
          }))
        };
        const formData = new FormData();
        formData.append("request", JSON.stringify(payload));
        kmlFiles.forEach((document) => {
          const file = document.file?.[0];
          if (file) formData.append("kmlFiles", file);
        });
        imageGallery.forEach((image) => {
          const file = image.files?.[0];
          if (file) formData.append("pngFiles", file);
        });

        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.misDocumentDetails(selectedSchemeId), {
          method: "POST",
          headers: {
            Authorization: authorization
          },
          body: formData
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setDocumentsEmploymentError(`Unable to save documents and employment details: ${error.message}`);
        return;
      } finally {
        setSavingDocumentsEmployment(false);
      }
    } else if (proposalSteps[activeStep].id === "techExitDeclaration") {
      setSavingTechExitDeclaration(true);
      setTechExitDeclarationError("");
      try {
        const values = getValues().techExitDeclaration || {};
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }

        const technologicalDocument = values.technologyDocument?.[0];
        const exitProtocolDocument = values.exitProtocolDocument?.[0];
        if (!technologicalDocument || !exitProtocolDocument) {
          throw new Error("Upload both required supporting documents.");
        }

        const payload = {
          technologicalInterventionDescription: (values.technologyIntervention || "").trim(),
          exitProtocolDescription: (values.exitProtocol || "").trim()
        };
        const formData = new FormData();
        formData.append("request", JSON.stringify(payload));
        formData.append("technologicalDocument", technologicalDocument);
        formData.append("exitProtocolDocument", exitProtocolDocument);

        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.misTechExit(selectedSchemeId), {
          method: "POST",
          headers: {
            Authorization: authorization
          },
          body: formData
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setTechExitDeclarationError(`Unable to save tech-exit declaration: ${error.message}`);
        return;
      } finally {
        setSavingTechExitDeclaration(false);
      }
    } else if (proposalSteps[activeStep].id === "installment") {
      setSavingInstallment(true);
      setInstallmentError("");
      try {
        const values = getValues().installment || {};
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }
        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }

        const bankDetails = values.bankDetails || {};
        const payload = {
          accountName: bankDetails.accountName.trim(),
          bankName: bankDetails.bankName.trim(),
          ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
          branchNameAddress: bankDetails.branchNameAddress.trim(),
          accountNumber: bankDetails.accountNumber.trim(),
          installments: (values.installments || []).map((installment) => ({
            financialYear: installment.financialYear,
            installmentNo: Number(installment.installmentNumber),
            duration: installment.duration.trim(),
            amountInLakh: Number(installment.amount)
          }))
        };
        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.misBankDetails(selectedSchemeId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorization
          },
          body: JSON.stringify(payload)
        });
        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }
      } catch (error) {
        setInstallmentError(`Unable to save installments and bank details: ${error.message}`);
        return;
      } finally {
        setSavingInstallment(false);
      }
    } else if (proposalSteps[activeStep].id === "reviewSubmission") {
      setSavingReviewSubmission(true);
      setReviewSubmissionError("");
      try {
        const selectedSchemeId = Number(schemeId);
        if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
          throw new Error("The selected scheme is missing a valid scheme ID.");
        }

        const accessToken = sessionStorage.getItem("campaJwt")?.trim();
        if (!accessToken || accessToken.toLowerCase() === "authenticated") {
          throw new Error("Your session is missing an access token. Please sign in again.");
        }

        const signatureFile = getValues("signatureFile")?.[0];
        if (!signatureFile) {
          throw new Error("Signature file is required.");
        }

        const supportingDocument = getValues("supportingDocument")?.[0];

        const formData = new FormData();
        formData.append("signatureFile", signatureFile);
        if (supportingDocument) {
          formData.append("supportingDocument", supportingDocument);
        }

        const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
        const response = await fetch(apiUrls.misFinalDocuments(selectedSchemeId), {
          method: "POST",
          headers: { Authorization: authorization },
          body: formData
        });

        const responseText = await response.text();
        let result;
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch {
            result = { message: responseText };
          }
        }

        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || `Request failed with status ${response.status}`);
        }

        // Show success message and redirect with preserved query parameters
        setSubmissionSuccess(true);
      } catch (error) {
        setReviewSubmissionError(`Unable to submit final documents: ${error.message}`);
        return;
      } finally {
        setSavingReviewSubmission(false);
      }
    }

    setSavedStepIndex(activeStep);
    setActiveStep((currentStep) => Math.min(currentStep + 1, proposalSteps.length - 1));
  };

  const handleSuccessModalClose = () => {
    const redirectUrl = scope && schemeId 
      ? `/dashboard/implementingAgency?scope=${scope}&schemeId=${schemeId}`
      : "/dashboard/implementingAgency";
    navigate(redirectUrl);
  };

  return (
    <FormProvider {...formMethods}>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f6f7f9", p: { xs: 1, md: 1.5 } }}>
      <Box
        aria-label="Proposal form steps"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(8, minmax(145px, 1fr))", lg: "repeat(8, minmax(0, 1fr))" },
          gap: 0.5,
          mb: 1.5,
          overflowX: "auto",
          p: 0.5,
          border: "1px solid #e0e4ea",
          borderRadius: 2,
          bgcolor: "#fff"
        }}
      >
        {proposalSteps.map((step, index) => {
          const isActive = index === activeStep;
          const isReview = index === proposalSteps.length - 1;
          return (
            <Button
              key={step.label}
              type="button"
              aria-current={isActive ? "step" : undefined}
              aria-label={`Go to step ${index + 1}: ${step.label}`}
              onClick={() => {
                setSavedStepIndex(null);
                setActiveStep(index);
              }}
              sx={{
                display: "flex",
                width: "100%",
                minHeight: 50,
                minWidth: 0,
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.25,
                border: "1px solid",
                borderColor: isActive ? "#80c6e8" : isReview ? "#b9ebc8" : "#f2df9e",
                borderRadius: 1,
                bgcolor: isActive ? "#e1f3fc" : isReview ? "#e0f9e8" : "#fffbed",
                color: isActive ? "#005e91" : isReview ? "#087638" : "#a95800",
                textAlign: "center",
                textTransform: "none",
                "&:hover": {
                  bgcolor: isActive ? "#e1f3fc" : isReview ? "#d2f3dd" : "#fff5d9"
                }
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  width: 20,
                  height: 20,
                  placeItems: "center",
                  borderRadius: "50%",
                  bgcolor: isActive ? "#0785c2" : isReview ? "#18a64c" : "#f49a00",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                {index + 1}
              </Box>
              <Typography sx={{ fontSize: 9, lineHeight: 1.15, whiteSpace: "nowrap" }}>{step.label}</Typography>
            </Button>
          );
        })}
      </Box>

      <Box
        component="form"
        noValidate
        onChange={() => {
          setSavedStepIndex(null);
          setBasicInfoError("");
        }}
        onSubmit={saveAndGoToNextStep}
        sx={{ display: activeStep === 0 ? "block" : "none" }}
      >
        {schemeNameLoading && <Typography role="status" sx={{ mb: 1, color: "text.secondary", fontSize: 12 }}>Loading selected scheme...</Typography>}
        {schemeNameError && <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>Unable to load selected scheme: {schemeNameError}</Typography>}
          <BasicInfoStep />
          {basicInfoError && <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>{basicInfoError}</Typography>}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, borderTop: "1px solid #e0e4ea", pt: 1.5 }}>
          <Button type="button" variant="outlined" disabled={savingBasicInfo || schemeNameLoading || Boolean(schemeNameError)} onClick={goToNextStep} sx={{ textTransform: "none", fontSize: 12 }}>
              Next
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={savingBasicInfo || schemeNameLoading || Boolean(schemeNameError)}
              sx={{ bgcolor: "#009b43", fontSize: 12, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#087f3d" } }}
            >
              {savingBasicInfo ? "Saving..." : "Save & Next"}
            </Button>
          </Box>
      </Box>
      {activeStep > 0 && (
        <Box
          component="form"
          noValidate
          onChange={() => {
            setSavedStepIndex(null);
            setObjectivesFundingError("");
            setDeliverablesError("");
            setEvaluationResearchError("");
            setDocumentsEmploymentError("");
            setTechExitDeclarationError("");
            setInstallmentError("");
            setReviewSubmissionError("");
          }}
          onSubmit={saveAndGoToNextStep}
        >
          {objectivesFundingError && activeStep === proposalSteps.findIndex((step) => step.id === "objectivesFunding") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {objectivesFundingError}
            </Typography>
          )}
          {deliverablesError && activeStep === proposalSteps.findIndex((step) => step.id === "deliverables") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {deliverablesError}
            </Typography>
          )}
          {evaluationResearchError && activeStep === proposalSteps.findIndex((step) => step.id === "evaluationResearch") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {evaluationResearchError}
            </Typography>
          )}
          {documentsEmploymentError && activeStep === proposalSteps.findIndex((step) => step.id === "documentsEmployment") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {documentsEmploymentError}
            </Typography>
          )}
          {techExitDeclarationError && activeStep === proposalSteps.findIndex((step) => step.id === "techExitDeclaration") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {techExitDeclarationError}
            </Typography>
          )}
          {installmentError && activeStep === proposalSteps.findIndex((step) => step.id === "installment") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {installmentError}
            </Typography>
          )}
          {reviewSubmissionError && activeStep === proposalSteps.findIndex((step) => step.id === "reviewSubmission") && (
            <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>
              {reviewSubmissionError}
            </Typography>
          )}
          <ActiveStepForm schemeId={schemeId} />
          {savedStepIndex !== null && activeStep === savedStepIndex + 1 && (
            <Typography role="status" sx={{ mt: 1, color: "#087638", fontSize: 12 }}>
              {proposalSteps[savedStepIndex].id === "objectivesFunding"
                ? "Objectives & Funding has been saved."
                : proposalSteps[savedStepIndex].id === "deliverables"
                  ? "Deliverables have been saved."
                  : proposalSteps[savedStepIndex].id === "evaluationResearch"
                    ? "Evaluation & Research has been saved."
                    : proposalSteps[savedStepIndex].id === "documentsEmployment"
                      ? "Documents & Employment have been saved."
                      : proposalSteps[savedStepIndex].id === "techExitDeclaration"
                        ? "Tech, Exit & Declaration has been saved."
                        : proposalSteps[savedStepIndex].id === "installment"
                          ? "Installments and bank details have been saved."
                : `${proposalSteps[savedStepIndex].label} is retained while this wizard is open. Draft saving to the server is not connected yet.`}
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              type="button"
              variant="outlined"
              disabled={savingObjectivesFunding || savingDeliverables || savingEvaluationResearch || savingDocumentsEmployment || savingTechExitDeclaration || savingInstallment}
              onClick={() => {
                setSavedStepIndex(null);
                setActiveStep((currentStep) => currentStep - 1);
              }}
              sx={{ textTransform: "none" }}
            >
              Previous
            </Button>
            {activeStep < proposalSteps.length - 1 ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                {activeStep === proposalSteps.findIndex((step) => step.id === "installment") ? (
                  <Button type="submit" variant="contained" disabled={savingInstallment} sx={{ textTransform: "none" }}>
                    {savingInstallment ? "Saving..." : "Proceed to Review & Final Submission"}
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outlined" disabled={savingObjectivesFunding || savingDeliverables || savingEvaluationResearch || savingDocumentsEmployment || savingTechExitDeclaration} onClick={goToNextStep} sx={{ textTransform: "none" }}>
                      {savingObjectivesFunding || savingDeliverables || savingEvaluationResearch || savingDocumentsEmployment || savingTechExitDeclaration ? "Saving..." : "Next"}
                    </Button>
                    <Button type="submit" variant="contained" disabled={savingObjectivesFunding || savingDeliverables || savingEvaluationResearch || savingDocumentsEmployment || savingTechExitDeclaration} sx={{ textTransform: "none" }}>
                      {savingObjectivesFunding || savingDeliverables || savingEvaluationResearch || savingDocumentsEmployment || savingTechExitDeclaration ? "Saving..." : "Save & Next"}
                    </Button>
                  </>
                )}
              </Box>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={savingReviewSubmission}
                sx={{
                  textTransform: "none",
                  bgcolor: "#009b43",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#087f3d" }
                }}
              >
                {savingReviewSubmission ? "Submitting..." : "Submit"}
              </Button>
            )}
          </Box>
        </Box>
      )}
      </Box>

      {/* Success Modal */}
      <SuccessModal
        open={submissionSuccess}
        title="Submitted successfully"
        onClose={handleSuccessModalClose}
        buttonText="OK"
      />
    </FormProvider>
  );
}

export default SchemeProposalWizard;
