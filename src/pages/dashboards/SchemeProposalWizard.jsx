import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Typography
} from "@mui/material";
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
  const schemeId = searchParams.get("schemeId");
  const [activeStep, setActiveStep] = useState(0);
  const [savedStepIndex, setSavedStepIndex] = useState(null);
  const formMethods = useForm({
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      ...Object.fromEntries(proposalSteps.slice(1).map(({ id }) => [id, { username: "" }])),
      objectivesFunding: {
        objectives: [],
        hasStateComponents: "",
        stateBoardAgreement: "",
        hasOtherFundingAgency: ""
      },
      schemeName: "",
      organizationName: "",
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
  const { getValues, setValue, trigger } = formMethods;
  const ActiveStepForm = activeStep > 0 ? laterStepComponents[activeStep - 1] : null;
  const [savingBasicInfo, setSavingBasicInfo] = useState(false);
  const [basicInfoError, setBasicInfoError] = useState("");
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
    const fields = proposalSteps[activeStep].fields;
    return fields.length === 0 || trigger(fields);
  };

  const goToNextStep = async () => {
    if (activeStep === 0) {
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
          schemeId: schemeSubmissionIds.schemeId
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
    }

    setSavedStepIndex(activeStep);
    setActiveStep((currentStep) => Math.min(currentStep + 1, proposalSteps.length - 1));
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
        <Box component="form" noValidate onChange={() => setSavedStepIndex(null)} onSubmit={saveAndGoToNextStep}>
          <ActiveStepForm />
          {savedStepIndex !== null && activeStep === savedStepIndex + 1 && (
            <Typography role="status" sx={{ mt: 1, color: "#087638", fontSize: 12 }}>
              {proposalSteps[savedStepIndex].label} is retained while this wizard is open. Draft saving to the server is not connected yet.
            </Typography>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button
              type="button"
              variant="outlined"
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
                <Button type="button" variant="outlined" onClick={goToNextStep} sx={{ textTransform: "none" }}>
                  Next
                </Button>
                <Button type="submit" variant="contained" sx={{ textTransform: "none" }}>
                  Save & Next
                </Button>
              </Box>
            ) : (
              <Button type="button" variant="contained" disabled sx={{ textTransform: "none" }}>
                Submit
              </Button>
            )}
          </Box>
        </Box>
      )}
      </Box>
    </FormProvider>
  );
}

export default SchemeProposalWizard;
