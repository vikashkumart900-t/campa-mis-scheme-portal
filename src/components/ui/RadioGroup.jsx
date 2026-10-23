export default function RadioGroup({
  label,
  name,
  value,
  onChange,
  options = []
}) {
  return (
    <fieldset className="form-field">
      {label && <span className="field-label">{label}</span>}
      <div className="radio-group">
        {options.map((option) => (
          <label key={option.value} className="radio-option">
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange?.({ target: { name, value: option.value } })}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
