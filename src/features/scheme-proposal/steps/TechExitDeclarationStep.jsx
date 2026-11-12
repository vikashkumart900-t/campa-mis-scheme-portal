import ProposalStepSection from "../components/ProposalStepSection";
import ProposalUsernameField from "../components/ProposalUsernameField";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[5];

function TechExitDeclarationStep() {
  return (
    <ProposalStepSection stepNumber={6} title={step.label}>
      <ProposalUsernameField name={`${step.id}.username`} required={step.required !== false} />
    </ProposalStepSection>
  );
}

export default TechExitDeclarationStep;