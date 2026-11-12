import ProposalStepSection from "../components/ProposalStepSection";
import ProposalUsernameField from "../components/ProposalUsernameField";
import { proposalSteps } from "../config/proposalSteps";

const step = proposalSteps[3];

function EvaluationResearchStep() {
  return (
    <ProposalStepSection stepNumber={4} title={step.label}>
      <ProposalUsernameField name={`${step.id}.username`} required={step.required !== false} />
    </ProposalStepSection>
  );
}

export default EvaluationResearchStep;