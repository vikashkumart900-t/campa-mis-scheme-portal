export default function DocumentUpload({
  label,
  name,
  onChange,
  helperText = "Upload PDF or image",
  accept = ".pdf,.doc,.docx,.jpg,.png"
}) {
  return (
    <div className="form-field">
      {label && <span className="field-label">{label}</span>}
      <div className="upload-box">
        <input
          id={name}
          type="file"
          accept={accept}
          name={name}
          onChange={onChange}
        />
        <label htmlFor={name}>{helperText}</label>
      </div>
    </div>
  );
}
