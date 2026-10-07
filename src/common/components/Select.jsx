export default function Select({
  label,
  value,
  options = [],
  onChange,
  name,
  placeholder = "Choose an option",
  required = false,
  disabled = false
}) {
  return (
    <label className="form-field">
      {label && <span className="field-label">{label}</span>}
      <select
        className="form-select"
        value={value}
        name={name}
        required={required}
        disabled={disabled}
        onChange={onChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
