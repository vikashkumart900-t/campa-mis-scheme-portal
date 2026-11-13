import ProposalStepSection from "../components/ProposalStepSection";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[2];

function DeliverablesStep() {
  return (
    <ProposalStepSection stepNumber={3} title={step.label} />
  );
}

export default DeliverablesStep;