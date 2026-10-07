export default function TextArea({
  label,
  value,
  onChange,
  name,
  placeholder,
  required = false,
  disabled = false
}) {
  return (
    <label className="form-field">
      {label && <span className="field-label">{label}</span>}
      <textarea
        className="form-textarea"
        value={value}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        onChange={onChange}
      />
    </label>
  );
}
