import ProposalStepSection from "../components/ProposalStepSection";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[6];

function InstallmentStep() {
  return (
    <ProposalStepSection stepNumber={7} title={step.label} />
  );
}

export default InstallmentStep;