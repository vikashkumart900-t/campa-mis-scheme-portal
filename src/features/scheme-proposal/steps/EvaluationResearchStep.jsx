import ProposalStepSection from "../components/ProposalStepSection";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[3];

function EvaluationResearchStep() {
  return (
    <ProposalStepSection stepNumber={4} title={step.label} />
  );
}

export default EvaluationResearchStep;