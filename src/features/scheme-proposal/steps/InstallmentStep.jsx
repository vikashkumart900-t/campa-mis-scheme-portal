import ProposalStepSection from "../components/ProposalStepSection";
import ProposalUsernameField from "../components/ProposalUsernameField";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[6];

function InstallmentStep() {
  return (
    <ProposalStepSection stepNumber={7} title={step.label}>
      <ProposalUsernameField name={`${step.id}.username`} required={step.required !== false} />
    </ProposalStepSection>
  );
}

export default InstallmentStep;