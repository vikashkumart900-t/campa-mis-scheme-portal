export const proposalSteps = [
  {
    id: "basicInfo",
    label: "Basic Info",
    fields: [
      "schemeName",
      "organizationName",
      "officerName",
      "designation",
      "email",
      "mobile",
      "aadhaarNumber",
      "dateOfProposal",
      "expectedCompletionDate",
      "proposedFinancialOutlay",
      "schemeDuration"
    ]
  },
  {
    id: "objectivesFunding",
    label: "Objectives & Funding",
    fields: [
      "objectivesFunding.hasStateComponents",
      "objectivesFunding.stateBoardAgreement",
      "objectivesFunding.hasOtherFundingAgency",
      "objectivesFunding.stateAgreementDocument",
      "objectivesFunding.otherFundingAgencyDocument"
    ]
  },
  { id: "deliverables", label: "Deliverables", fields: [] },
  {
    id: "evaluationResearch",
    label: "Evaluation & Research",
    fields: [
      "evaluationResearch.monitoringAnnually",
      "evaluationResearch.midtermEvaluation",
      "evaluationResearch.researchAspects"
    ]
  },
  {
    id: "documentsEmployment",
    label: "Documents & Employment",
    fields: ["documentsEmployment.imageDescription", "documentsEmployment.imageFiles"]
  },
  {
    id: "techExitDeclaration",
    label: "Tech, Exit & Declaration",
    fields: [
      "techExitDeclaration.technologyIntervention",
      "techExitDeclaration.technologyDocument",
      "techExitDeclaration.exitProtocol",
      "techExitDeclaration.exitProtocolDocument",
      "techExitDeclaration.declaration1",
      "techExitDeclaration.declaration2"
    ]
  },
  { id: "installment", label: "Installment", fields: [] },
  { id: "reviewSubmission", label: "Review & Final Submission", fields: [] }
];