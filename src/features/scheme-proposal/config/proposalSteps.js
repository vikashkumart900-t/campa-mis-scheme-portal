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
  { id: "objectivesFunding", label: "Objectives & Funding", fields: ["objectivesFunding.username"], required: false },
  { id: "deliverables", label: "Deliverables", fields: ["deliverables.username"], required: false },
  { id: "evaluationResearch", label: "Evaluation & Research", fields: ["evaluationResearch.username"], required: false },
  { id: "documentsEmployment", label: "Documents & Employment", fields: ["documentsEmployment.username"], required: false },
  { id: "techExitDeclaration", label: "Tech, Exit & Declaration", fields: ["techExitDeclaration.username"], required: false },
  { id: "installment", label: "Installment", fields: ["installment.username"], required: false },
  { id: "reviewSubmission", label: "Review & Final Submission", fields: ["reviewSubmission.username"], required: false }
];