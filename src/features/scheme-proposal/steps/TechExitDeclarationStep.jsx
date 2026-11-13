import ProposalStepSection from "../components/ProposalStepSection";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[5];

function TechExitDeclarationStep() {
  return (
    <ProposalStepSection stepNumber={6} title={step.label} />
  );
}

export default TechExitDeclarationStep;