import ProposalStepSection from "../components/ProposalStepSection";
import ProposalUsernameField from "../components/ProposalUsernameField";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[4];

function DocumentsEmploymentStep() {
  return (
    <ProposalStepSection stepNumber={5} title={step.label}>
      <ProposalUsernameField name={`${step.id}.username`} required={step.required !== false} />
    </ProposalStepSection>
  );
}

export default DocumentsEmploymentStep;