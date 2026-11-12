import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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
  const [activeStep, setActiveStep] = useState(0);
  const [savedStepIndex, setSavedStepIndex] = useState(null);
  const formMethods = useForm({
    mode: "onBlur",
    shouldUnregister: false,
    defaultValues: {
      ...Object.fromEntries(proposalSteps.slice(1).map(({ id }) => [id, { username: "" }])),
      schemeName: "",
      implementingAgency: "",
      nodalOfficerName: "",
      designation: "",
      email: "",
      phone: "",
      aadhaarNumber: "",
      proposalDate: "",
      expectedCompletionDate: "",
      financialOutlay: "",
      schemeDuration: ""
    }
  });
  const { trigger } = formMethods;
  const ActiveStepForm = activeStep > 0 ? laterStepComponents[activeStep - 1] : null;

  const validateCurrentStep = async () => {
    const fields = proposalSteps[activeStep].fields;
    return fields.length === 0 || trigger(fields);
  };

  const goToNextStep = async () => {
    if (!(await validateCurrentStep())) return;
    setActiveStep((currentStep) => Math.min(currentStep + 1, proposalSteps.length - 1));
  };

  const saveAndGoToNextStep = async (event) => {
    event.preventDefault();
    if (!(await validateCurrentStep())) return;
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
        onChange={() => setSavedStepIndex(null)}
        onSubmit={saveAndGoToNextStep}
        sx={{ display: activeStep === 0 ? "block" : "none" }}
      >
          <BasicInfoStep />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, borderTop: "1px solid #e0e4ea", pt: 1.5 }}>
            <Button type="button" variant="outlined" onClick={goToNextStep} sx={{ textTransform: "none", fontSize: 12 }}>
              Next
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: "#009b43", fontSize: 12, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#087f3d" } }}
            >
              Save &amp; Next
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
                  Save &amp; Next
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
