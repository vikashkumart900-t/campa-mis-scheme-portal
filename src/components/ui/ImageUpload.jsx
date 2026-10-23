import { useState } from "react";

export default function ImageUpload({
  label,
  name,
  onChange,
  accept = "image/*",
  helperText = "Drag and drop or browse"
}) {
  const [preview, setPreview] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview("");
      return;
    }

    onChange?.(event);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="form-field">
      {label && <span className="field-label">{label}</span>}
      <div className="upload-box">
        <input
          id={name}
          type="file"
          accept={accept}
          name={name}
          onChange={handleFileChange}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="upload-preview" />
        ) : (
          <label htmlFor={name}>{helperText}</label>
        )}
      </div>
      <span className="upload-meta">Accepts JPG, PNG, or WebP files.</span>
    </div>
  );
}
