import ProposalStepSection from "../components/ProposalStepSection";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[4];

function DocumentsEmploymentStep() {
  return (
    <ProposalStepSection stepNumber={5} title={step.label} />
  );
}

export default DocumentsEmploymentStep;