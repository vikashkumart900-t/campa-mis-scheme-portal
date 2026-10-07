export default function MultiSelect({
  label,
  options = [],
  value = [],
  onChange,
  name
}) {
  const toggleOption = (optionValue) => {
    const nextValues = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onChange?.({ target: { name, value: nextValues } });
  };

  return (
    <fieldset className="form-field">
      {label && <span className="field-label">{label}</span>}
      <div className="multi-select">
        {options.map((option) => (
          <label key={option.value} className="multi-option">
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              onChange={() => toggleOption(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
