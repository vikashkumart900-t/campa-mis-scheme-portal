# SuccessModal Component - Usage Guide

## Overview
A reusable, Material-UI based success modal component following the project's design standards. It displays a checkmark icon with a success message and an action button.

## Location
`src/components/ui/SuccessModal.jsx`

## Component Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `open` | boolean | ✅ Yes | - | Controls modal visibility |
| `title` | string | ✅ Yes | - | Main title text (e.g., "Registered successfully") |
| `message` | string | ❌ No | - | Optional descriptive message below title |
| `onClose` | function | ✅ Yes | - | Callback when user clicks OK button or closes modal |
| `buttonText` | string | ❌ No | "OK" | Custom text for the action button |

## Usage Example

### Basic Usage (Proposal Submission)
```jsx
import { SuccessModal } from "../../components/ui";

export default function MyComponent() {
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSuccessModalClose = () => {
    // Perform any navigation or action when modal closes
    navigate("/dashboard");
  };

  return (
    <>
      {/* Your form or content */}
      
      <SuccessModal
        open={submissionSuccess}
        title="Registered successfully"
        onClose={handleSuccessModalClose}
        buttonText="OK"
      />
    </>
  );
}
```

### With Optional Message
```jsx
<SuccessModal
  open={submissionSuccess}
  title="Payment Processed"
  message="Your payment has been processed successfully. You will receive a confirmation email shortly."
  onClose={handleSuccessModalClose}
  buttonText="Continue"
/>
```

## Styling Features
✅ Green checkmark icon with circular background
✅ Material-UI Dialog component for accessibility
✅ Responsive design (works on all screen sizes)
✅ Smooth animations and transitions
✅ Consistent with project's design system (Teal/Green color scheme)
✅ Proper shadow and border radius styling

## Color Scheme
- **Icon**: Green (#16a34a)
- **Icon Background**: Light green (rgba(22, 163, 74, 0.1))
- **Title**: Teal (#0f766e)
- **Button**: Green (#16a34a) with hover state (#15803d)

## Implementation in Current Components

### SchemeProposalWizard.jsx
```jsx
// 1. Import the component
import { SuccessModal } from "../../components/ui";

// 2. Add state to track submission success
const [submissionSuccess, setSubmissionSuccess] = useState(false);

// 3. Set success state after successful API call
// In the reviewSubmission handler:
setSubmissionSuccess(true);

// 4. Create close handler (with any necessary navigation/actions)
const handleSuccessModalClose = () => {
  navigate(`/dashboard/implementingAgency?scope=${scope}&schemeId=${schemeId}`);
};

// 5. Add modal to JSX
<SuccessModal
  open={submissionSuccess}
  title="Registered successfully"
  onClose={handleSuccessModalClose}
  buttonText="OK"
/>
```

## Where to Use This Component

✅ Form submission confirmations
✅ Payment/transaction completions
✅ Account registrations
✅ Document uploads
✅ Proposal submissions
✅ Any success action requiring user acknowledgment

## Accessibility Features
- Proper Dialog component for screen readers
- Semantic HTML structure
- Clear focus management
- Descriptive titles and messages
