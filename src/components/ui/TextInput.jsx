export default function TextInput({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  required = false,
  disabled = false
}) {
  return (
    <label className="form-field">
      {label && <span className="field-label">{label}</span>}
      <input
        className="form-control"
        type={type}
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
