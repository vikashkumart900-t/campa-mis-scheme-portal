import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import { FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { apiUrls } from "../../../api/urls";
import revisedGuidelinesPdf from "../../../assets/Revised guidelines for proposing schemes (29.12.2025).pdf";

const sectionSx = {
  mb: 1.5,
  p: { xs: 2, md: 2.5 },
  border: "1px solid #e0e4ea",
  borderRadius: 2,
  bgcolor: "#f9fafb"
};

const titleSx = {
  mb: 2,
  color: "#132e4c",
  fontSize: 14,
  fontWeight: 700
};

const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputBase-input": { py: 0.9, px: 1.25, fontSize: 12 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dce2e8" }
};

const uploadTitleSx = {
  display: "block",
  mb: 0.75,
  color: "#344457",
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase"
};

const formLabelSx = {
  fontSize: 10,
  fontWeight: 700,
  color: "#132e4c",
  textTransform: "uppercase",
  mb: 0.75
};

function TechExitDeclarationStep() {
  const [searchParams] = useSearchParams();
  const {
    register,
    setValue,
    formState: { errors }
  } = useFormContext();
  const [technologyDocumentName, setTechnologyDocumentName] = useState("");
  const [exitProtocolDocumentName, setExitProtocolDocumentName] = useState("");
  const [techExitLoading, setTechExitLoading] = useState(true);
  const [techExitError, setTechExitError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const schemeId = searchParams.get("schemeId");
    const accessToken = sessionStorage.getItem("campaJwt")?.trim();

    if (!schemeId || schemeId === "authenticated") {
      setTechExitLoading(false);
      return;
    }

    if (!accessToken || accessToken.toLowerCase() === "authenticated") {
      setTechExitLoading(false);
      return;
    }

    const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;

    fetch(apiUrls.techExit(schemeId), {
      signal: controller.signal,
      headers: { Authorization: authorization }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Tech Exit API Response:", data);

        if (data) {
          // Set technological intervention description
          if (data.technologicalInterventionDescription) {
            setValue("techExitDeclaration.technologyIntervention", data.technologicalInterventionDescription, { shouldDirty: false });
          }

          // Set technological document
          if (data.technologicalDocumentName) {
            setTechnologyDocumentName(data.technologicalDocumentName);
            setValue("techExitDeclaration.technologyDocument", [{ name: data.technologicalDocumentName, path: data.technologicalDocumentName }], { shouldDirty: false });
          }

          // Set exit protocol description
          if (data.exitProtocolDescription) {
            setValue("techExitDeclaration.exitProtocol", data.exitProtocolDescription, { shouldDirty: false });
          }

          // Set exit protocol document
          if (data.exitProtocolDocumentName) {
            setExitProtocolDocumentName(data.exitProtocolDocumentName);
            setValue("techExitDeclaration.exitProtocolDocument", [{ name: data.exitProtocolDocumentName, path: data.exitProtocolDocumentName }], { shouldDirty: false });
          }

          setTechExitError("");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching tech exit data:", error);
          setTechExitError(`Unable to load tech exit details: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setTechExitLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchParams, setValue]);

  const setFileName = (setter, event) => {
    setter(event.target.files?.[0]?.name || "");
  };

  return (
    <>
      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h1" sx={titleSx}>
          12. Technological Intervention in implementing the scheme
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 370px" }, gap: 2, alignItems: "end" }}>
          <Box>
            <Typography component="label" sx={{ ...uploadTitleSx, color: "#132e4c" }}>
              12.1 DESCRIPTION OF TECHNOLOGICAL INTERVENTION IN IMPLEMENTING THE SCHEME <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Describe technological interventions (max 500 words)"
              sx={inputSx}
              error={Boolean(errors?.techExitDeclaration?.technologyIntervention)}
              helperText={errors?.techExitDeclaration?.technologyIntervention?.message}
              {...register("techExitDeclaration.technologyIntervention", {
                required: "Description is required.",
                validate: (value) => {
                  const trimmedValue = value?.trim?.() || "";
                  if (!trimmedValue) return "Description is required.";
                  return trimmedValue.split(/\s+/).filter(Boolean).length <= 500 || "Description must be 500 words or fewer.";
                }
              })}
            />
          </Box>

          <Box>
            <Typography component="label" sx={uploadTitleSx}>
              UPLOAD SUPPORTING DOCUMENT <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <FormControl fullWidth error={Boolean(errors?.techExitDeclaration?.technologyDocument)}>
              <Box sx={{ display: "flex", minHeight: 34, alignItems: "center", overflow: "hidden", border: "1px solid #cfd7e2", borderRadius: 1, bgcolor: "#fff" }}>
                <Button
                  component="label"
                  htmlFor="technology-document-upload"
                  sx={{ height: 34, px: 1.5, borderRight: "1px solid #cfd7e2", borderRadius: 0, color: "#132e4c", bgcolor: "#f1f4f8", fontSize: 11, textTransform: "none", whiteSpace: "nowrap" }}
                >
                  Choose File
                  <input
                    id="technology-document-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    hidden
                    {...register("techExitDeclaration.technologyDocument", {
                      required: "A supporting document is required.",
                      onChange: (event) => {
                        setFileName(setTechnologyDocumentName, event);
                      }
                    })}
                  />
                </Button>
                <Typography aria-live="polite" sx={{ overflow: "hidden", px: 1.25, color: "#344457", fontSize: 11, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {technologyDocumentName || "No file chosen"}
                </Typography>
              </Box>
              {errors?.techExitDeclaration?.technologyDocument && (
                <FormHelperText sx={{ mt: 0.5, ml: 0.5 }}>{errors.techExitDeclaration.technologyDocument.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={titleSx}>
          13. Exit protocol of the scheme
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 370px" }, gap: 2, alignItems: "end" }}>
          <Box>
            <Typography component="label" sx={{ ...uploadTitleSx, color: "#132e4c" }}>
              13.1 DESCRIPTION OF EXIT PROTOCOL OF THE SCHEME <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Describe exit protocol (minimum 250 words)"
              sx={inputSx}
              error={Boolean(errors?.techExitDeclaration?.exitProtocol)}
              helperText={errors?.techExitDeclaration?.exitProtocol?.message}
              {...register("techExitDeclaration.exitProtocol", {
                required: "Description is required.",
                validate: (value) => {
                  const trimmedValue = value?.trim?.() || "";
                  if (!trimmedValue) return "Description is required.";
                  return trimmedValue.split(/\s+/).filter(Boolean).length >= 250 || "Description must be at least 250 words.";
                }
              })}
            />
          </Box>

          <Box>
            <Typography component="label" sx={uploadTitleSx}>
              UPLOAD SUPPORTING DOCUMENT <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <FormControl fullWidth error={Boolean(errors?.techExitDeclaration?.exitProtocolDocument)}>
              <Box sx={{ display: "flex", minHeight: 34, alignItems: "center", overflow: "hidden", border: "1px solid #cfd7e2", borderRadius: 1, bgcolor: "#fff" }}>
                <Button
                  component="label"
                  htmlFor="exit-protocol-document-upload"
                  sx={{ height: 34, px: 1.5, borderRight: "1px solid #cfd7e2", borderRadius: 0, color: "#132e4c", bgcolor: "#f1f4f8", fontSize: 11, textTransform: "none", whiteSpace: "nowrap" }}
                >
                  Choose File
                  <input
                    id="exit-protocol-document-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    hidden
                    {...register("techExitDeclaration.exitProtocolDocument", {
                      required: "A supporting document is required.",
                      onChange: (event) => {
                        setFileName(setExitProtocolDocumentName, event);
                      }
                    })}
                  />
                </Button>
                <Typography aria-live="polite" sx={{ overflow: "hidden", px: 1.25, color: "#344457", fontSize: 11, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {exitProtocolDocumentName || "No file chosen"}
                </Typography>
              </Box>
              {errors?.techExitDeclaration?.exitProtocolDocument && (
                <FormHelperText sx={{ mt: 0.5, ml: 0.5 }}>{errors.techExitDeclaration.exitProtocolDocument.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={sectionSx}>
        <Typography component="h2" sx={{ ...titleSx, mb: 1.5 }}>
          14. Declaration
        </Typography>

        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Box>
            <Typography sx={formLabelSx}>
              14.1 DECLARATION <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <FormControl error={Boolean(errors?.techExitDeclaration?.declaration1)}>
              <Box sx={{ border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff", px: 1.25, py: 0.75 }}>
                <FormControlLabel
                  sx={{ alignItems: "flex-start", width: "100%", m: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ mt: 0.1, color: "#808080", "&.Mui-checked": { color: "#0b6037" } }}
                      {...register("techExitDeclaration.declaration1", { required: "This declaration is required." })}
                    />
                  }
                  label={
                    <Typography sx={{ mt: 1.5, fontSize: 12, lineHeight: 1.5, color: "#244056" }}>
                      The Programme Division (PD) will ensure that the implementing Agency (IA) shall adhere to provision of GFR 2017 and Government Accounting Rules 1990.
                    </Typography>
                  }
                />
              </Box>
              {errors?.techExitDeclaration?.declaration1 && (
                <FormHelperText sx={{ mt: 0.5 }}>{errors.techExitDeclaration.declaration1.message}</FormHelperText>
              )}
            </FormControl>
          </Box>

          <Box>
            <Typography sx={{ ...formLabelSx, mt: 2 }}>
              14.2 DECLARATION <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>
            </Typography>
            <FormControl error={Boolean(errors?.techExitDeclaration?.declaration2)}>
              <Box sx={{ border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff", px: 1.25, py: 0.75 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}>
                  <FormControlLabel
                    sx={{ alignItems: "flex-start", flex: 1, m: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        sx={{ mt: 0.1, color: "#808080", "&.Mui-checked": { color: "#0b6037" } }}
                        {...register("techExitDeclaration.declaration2", { required: "This declaration is required." })}
                      />
                    }
                    label={
                      <Typography sx={{ mt: 1.5, fontSize: 12, lineHeight: 1.5, color: "#244056" }}>
                        The Implementing Agency (IA) is required to comply with the provisions as stated in the OM no. NA-13/13/2022-NA dated 29.12.2022 issued by the National Authority.
                      </Typography>
                    }
                  />
                  <IconButton
                    component="a"
                    href={revisedGuidelinesPdf}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open revised guidelines PDF"
                    sx={{
                      width: 28,
                      height: 28,
                      border: "1px solid #e3b45d",
                      borderRadius: 1,
                      bgcolor: "#fff7dc",
                      color: "#9a6700",
                      '&:hover': { bgcolor: "#fdf1c4" }
                    }}
                  >
                    <FileText size={14} />
                  </IconButton>
                </Box>
              </Box>
              {errors?.techExitDeclaration?.declaration2 && (
                <FormHelperText sx={{ mt: 0.5 }}>{errors.techExitDeclaration.declaration2.message}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </Box>
      </Paper>
    </>
  );
}

export default TechExitDeclarationStep;