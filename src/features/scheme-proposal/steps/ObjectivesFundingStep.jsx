import ProposalStepSection from "../components/ProposalStepSection";
import ProposalUsernameField from "../components/ProposalUsernameField";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[1];

function ObjectivesFundingStep() {
  return (
    <ProposalStepSection stepNumber={2} title={step.label}>
      <ProposalUsernameField name={`${step.id}.username`} required={step.required !== false} />
    </ProposalStepSection>
  );
}

export default ObjectivesFundingStep;