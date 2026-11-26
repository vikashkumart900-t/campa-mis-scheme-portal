import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  IconButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { apiUrls } from "../../../api/urls";

const selectAllDistrictsValue = "__select_all_districts__";

function normalizeDistrictValue(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

function getSavedDistrictValue(district) {
  if (typeof district === "string" || typeof district === "number") {
    return String(district).trim();
  }
  return String(district?.districtName ?? district?.districtCode ?? district?.districtId ?? "").trim();
}

const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputLabel-root": { fontSize: 12 }
};

const selectSx = {
  fontSize: 12,
  "& .MuiSelect-select": { fontSize: 12 }
};

const readOnlyInputSx = {
  ...inputSx,
  "& .MuiInputBase-root": { ...inputSx["& .MuiInputBase-root"], bgcolor: "#f1f3f5" },
  "& .MuiInputBase-input": { color: "#667085", cursor: "not-allowed" }
};

function calculateSchemeDuration(startValue, endValue) {
  if (!startValue || !endValue) return "";

  const parseDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) return null;
    return date;
  };

  const start = parseDate(startValue);
  const end = parseDate(endValue);
  if (!start || !end || end < start) return "";

  let totalMonths =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth());
  if (end.getUTCDate() < start.getUTCDate()) totalMonths -= 1;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const startYear = start.getUTCMonth() >= 3
    ? start.getUTCFullYear()
    : start.getUTCFullYear() - 1;
  const endYear = end.getUTCMonth() >= 3
    ? end.getUTCFullYear()
    : end.getUTCFullYear() - 1;
  const startFiscalYear = `${startYear}-${String(startYear + 1).slice(-2)}`;
  const endFiscalYear = `${endYear}-${String(endYear + 1).slice(-2)}`;

  return `${startFiscalYear} to ${endFiscalYear} (${years} year ${months} month)`;
}

const sectionTitleSx = {
  mb: 2,
  color: "#132e4c",
  fontSize: 14,
  fontWeight: 700
};

function FormField({ id, label, required = false, children }) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        sx={{ display: "block", mb: 0.75, color: "#344457", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}
      >
        {label} {required && <Box component="span" sx={{ color: "#d32f2f" }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );
}

function StateDistrictRow({
  control,
  index,
  states,
  otherSelectedStateCodes,
  statesLoading,
  statesUnavailable,
  canRemove,
  onRemove
}) {
  const { setValue } = useFormContext();
  const stateFieldName = `stateDistrictSelections.${index}.stateCode`;
  const districtIdsFieldName = `stateDistrictSelections.${index}.districtIds`;
  const stateCode = useWatch({ control, name: stateFieldName }) || "";
  const districtIds = useWatch({ control, name: districtIdsFieldName }) || [];
  const stateName = useWatch({ control, name: `stateDistrictSelections.${index}.stateName` }) || "";
  const districtNames = useWatch({ control, name: `stateDistrictSelections.${index}.districtNames` }) || [];
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState("");

  const unmatchedDistrictNames = districts.length
    ? districtNames.filter((name) =>
      !districts.some((district) => normalizeDistrictValue(district.districtName) === normalizeDistrictValue(name))
    )
    : [];

  useEffect(() => {
    if (!stateCode) return undefined;

    const controller = new AbortController();
    fetch(apiUrls.registrationDistricts(stateCode), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((districtOptions) => {
        if (!Array.isArray(districtOptions) || districtOptions.some(
          (district) =>
            district?.districtId == null ||
            district?.districtCode == null ||
            typeof district.districtName !== "string"
        )) {
          throw new Error("The districts API returned unexpected dropdown data.");
        }
        setDistricts(districtOptions);
        setDistrictsError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setDistrictsError(`Unable to load districts: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDistrictsLoading(false);
        }
      });

    return () => controller.abort();
  }, [stateCode]);

  const selectedDistrictLabels = districtNames.filter(Boolean);

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1.5fr) auto" }, gap: 1.5, alignItems: "start" }}>
      <FormField id={`proposal-state-${index}`} label={`State ${index + 1}`}>
        <FormControl fullWidth size="small" error={statesUnavailable}>
          <Select
            id={`proposal-state-${index}`}
            sx={selectSx}
            value={stateCode}
            displayEmpty
            disabled={statesLoading || statesUnavailable}
            onChange={(event) => {
              const nextStateCode = event.target.value;
              const nextState = states.find((state) => String(state.stateCode) === nextStateCode);
              setValue(stateFieldName, nextStateCode, { shouldDirty: true });
              setValue(`stateDistrictSelections.${index}.stateName`, nextState?.stateName || "", { shouldDirty: true });
              setValue(districtIdsFieldName, [], { shouldDirty: true });
              setValue(`stateDistrictSelections.${index}.districtCodes`, [], { shouldDirty: true });
              setValue(`stateDistrictSelections.${index}.districtNames`, [], { shouldDirty: true });
              setDistricts([]);
              setDistrictsError("");
              setDistrictsLoading(Boolean(nextStateCode));
            }}
          >
            <MenuItem value="" sx={{ fontSize: 12 }}>Select state</MenuItem>
            {states
              .filter((state) =>
                String(state.stateCode) === String(stateCode) ||
                !otherSelectedStateCodes.includes(String(state.stateCode))
              )
              .map((state) => (
                <MenuItem key={state.stateCode} value={String(state.stateCode)} sx={{ fontSize: 12 }}>
                  {state.stateName}
                </MenuItem>
              ))}
          </Select>
          {statesUnavailable && <FormHelperText>Unable to load states.</FormHelperText>}
        </FormControl>
      </FormField>
      <FormField id={`proposal-districts-${index}`} label={`Districts for ${stateName || `State ${index + 1}`}`}>
        <FormControl fullWidth size="small" disabled={!stateCode || districtsLoading || Boolean(districtsError)}>
          <Select
            id={`proposal-districts-${index}`}
            multiple
            displayEmpty
            sx={selectSx}
            value={districtIds}
            onChange={(event) => {
              const selectedValues = typeof event.target.value === "string"
                ? event.target.value.split(",")
                : event.target.value;
              const selectAllRequested = selectedValues.includes(selectAllDistrictsValue);
              const nextDistrictIds = selectAllRequested
                ? (districtIds.length === districts.length
                  ? []
                  : districts.map((district) => String(district.districtId)))
                : selectedValues;
              const nextDistrictNames = districts
                .filter((district) => nextDistrictIds.includes(String(district.districtId)))
                .map((district) => district.districtName);
              const nextDistrictCodes = districts
                .filter((district) => nextDistrictIds.includes(String(district.districtId)))
                .map((district) => String(district.districtCode));
              setValue(districtIdsFieldName, nextDistrictIds, { shouldDirty: true });
              setValue(`stateDistrictSelections.${index}.districtCodes`, nextDistrictCodes, { shouldDirty: true });
              setValue(`stateDistrictSelections.${index}.districtNames`, nextDistrictNames, { shouldDirty: true });
            }}
            renderValue={(selected) => {
              if (districts.length > 0 && selected.length === districts.length) {
                return "All districts selected";
              }
              if (selectedDistrictLabels.length > 0) {
                return selectedDistrictLabels.join(", ");
              }
              if (!selected.length) {
                return districtsLoading ? "Loading districts..." : "Select one or more districts";
              }
              return districts
                .filter((district) => selected.includes(String(district.districtId)))
                .map((district) => district.districtName)
                .join(", ");
            }}
          >
            {!stateCode && <MenuItem disabled value="" sx={{ fontSize: 12 }}>Select a state first</MenuItem>}
            {stateCode && districts.length > 0 && (
              <MenuItem value={selectAllDistrictsValue} sx={{ fontSize: 12 }}>
                <Checkbox checked={districtIds.length === districts.length} />
                <ListItemText primary="Select All" sx={{ "& .MuiListItemText-primary": { fontSize: 12 } }} />
              </MenuItem>
            )}
            {districts.map((district) => (
              <MenuItem key={district.districtId} value={String(district.districtId)} sx={{ fontSize: 12 }}>
                <Checkbox checked={districtIds.includes(String(district.districtId))} />
                <ListItemText primary={district.districtName} sx={{ "& .MuiListItemText-primary": { fontSize: 12 } }} />
              </MenuItem>
            ))}
          </Select>
          {districtsError && <FormHelperText error>{districtsError}</FormHelperText>}
        </FormControl>
        {selectedDistrictLabels.length > 0 && (
          <Typography role="status" sx={{ mt: 0.5, color: "#344457", fontSize: 11 }}>
            Selected districts: {selectedDistrictLabels.join(", ")}
          </Typography>
        )}
        {unmatchedDistrictNames.length > 0 && (
          <FormHelperText error>
            Saved districts not found for {stateName}: {unmatchedDistrictNames.join(", ")}. Verify the saved state and district mapping.
          </FormHelperText>
        )}
      </FormField>
      {canRemove && (
        <IconButton
          aria-label={`Remove state ${index + 1}`}
          onClick={onRemove}
          size="small"
          sx={{ mt: { xs: 0, md: 2.5 }, color: "#b42318" }}
        >
          ×
        </IconButton>
      )}
    </Box>
  );
}

function BasicInfoStep() {
  const [searchParams] = useSearchParams();
  const {
    control,
    register,
    setValue,
    formState: { errors }
  } = useFormContext();
  const dateOfProposal = useWatch({ control, name: "dateOfProposal" });
  const expectedCompletionDate = useWatch({ control, name: "expectedCompletionDate" });
  const {
    fields: stateDistrictFields,
    append: appendStateDistrict,
    remove: removeStateDistrict
  } = useFieldArray({ control, name: "stateDistrictSelections" });
  const stateDistrictSelections = useWatch({ control, name: "stateDistrictSelections" }) || [];
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");
  const [nodalOfficerLoading, setNodalOfficerLoading] = useState(true);
  const [nodalOfficerError, setNodalOfficerError] = useState("");
  const [basicInfoData, setBasicInfoData] = useState(null);

  const getFieldProps = (name, rules = {}) => {
    const fieldError = errors[name];
    return {
      ...register(name, rules),
      error: Boolean(fieldError),
      helperText: fieldError?.message
    };
  };

  useEffect(() => {
    setValue(
      "schemeDuration",
      calculateSchemeDuration(dateOfProposal, expectedCompletionDate),
      { shouldDirty: true }
    );
  }, [dateOfProposal, expectedCompletionDate, setValue]);

  useEffect(() => {
    const controller = new AbortController();

    const schemeId = searchParams.get("schemeId");
    const accessToken = sessionStorage.getItem("campaJwt")?.trim();

    if (!schemeId) {
      setNodalOfficerError("Scheme ID is required to load nodal officer details.");
      setNodalOfficerLoading(false);
      return;
    }

    if (!accessToken || accessToken.toLowerCase() === "authenticated") {
      setNodalOfficerError("Authentication required to load nodal officer details.");
      setNodalOfficerLoading(false);
      return;
    }

    const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;

    fetch(apiUrls.basicInfo(schemeId), {
      signal: controller.signal,
      headers: { Authorization: authorization }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((basicInfoResponse) => {
        console.log("API Response:", basicInfoResponse);

        let responseData = basicInfoResponse;
        
        if (Array.isArray(basicInfoResponse) && basicInfoResponse.length > 0) {
          responseData = basicInfoResponse[0];
        }

        if (!responseData || typeof responseData !== "object") {
          throw new Error("The basic info API returned unexpected data.");
        }

        console.log("Extracted Data:", responseData);
        setBasicInfoData(responseData);

        if (responseData.officerName) {
          setValue("officerName", responseData.officerName, { shouldDirty: false });
        }
        if (responseData.designation) {
          setValue("designation", responseData.designation, { shouldDirty: false });
        }
        if (responseData.email) {
          setValue("email", responseData.email, { shouldDirty: false });
        }
        if (responseData.mobile) {
          setValue("mobile", responseData.mobile, { shouldDirty: false });
        }
        if (responseData.aadhaarNumber) {
          setValue("aadhaarNumber", responseData.aadhaarNumber, { shouldDirty: false });
        }
        if (responseData.dateOfProposal) {
          setValue("dateOfProposal", responseData.dateOfProposal, { shouldDirty: false });
        }
        if (responseData.expectedCompletionDate) {
          setValue("expectedCompletionDate", responseData.expectedCompletionDate, { shouldDirty: false });
        }
        if (responseData.proposedFinancialOutlay) {
          setValue("proposedFinancialOutlay", responseData.proposedFinancialOutlay, { shouldDirty: false });
        }
        if (responseData.schemeDuration) {
          setValue("schemeDuration", responseData.schemeDuration, { shouldDirty: false });
        }

        setNodalOfficerError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Error fetching basic info details:", error);
          setNodalOfficerError(`Unable to load basic info details: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setNodalOfficerLoading(false);
        }
      });

    return () => controller.abort();
  }, [setValue, searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(apiUrls.states, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error((await response.text()) || `Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((stateOptions) => {
        if (!Array.isArray(stateOptions) || stateOptions.some(
          (state) => state?.stateCode == null || typeof state.stateName !== "string"
        )) {
          throw new Error("The state API returned unexpected dropdown data.");
        }
        setStates(stateOptions.filter((state) => state.isActive !== false));
        setStatesError("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setStatesError(`Unable to load states: ${error.message}`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setStatesLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!basicInfoData || !basicInfoData.schemeImplementingStates || states.length === 0) {
      return;
    }

    const accessToken = sessionStorage.getItem("campaJwt")?.trim();
    if (!accessToken || accessToken.toLowerCase() === "authenticated") {
      return;
    }

    const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;

    const processStateDistrictSelections = async () => {
      try {
        const stateDistrictSelectionsPromises = basicInfoData.schemeImplementingStates.map(async (state) => {
          const matchedState = states.find(
            (s) => s.stateName && s.stateName.toLowerCase() === state.stateName.toLowerCase()
          );

          if (!matchedState) {
            return {
              stateCode: "",
              stateName: state.stateName,
              districtIds: [],
              districtCodes: [],
              districtNames: []
            };
          }

          try {
            const districtResponse = await fetch(apiUrls.registrationDistricts(matchedState.stateCode), {
              headers: { Authorization: authorization }
            });

            if (!districtResponse.ok) {
              return {
                stateCode: String(matchedState.stateCode),
                stateName: state.stateName,
                districtIds: [],
                districtCodes: [],
                districtNames: (state.districts || []).map(getSavedDistrictValue).filter(Boolean)
              };
            }

            const districtOptions = await districtResponse.json();
            const savedDistrictValues = (state.districts || []).map(getSavedDistrictValue).filter(Boolean);
            const matchedDistricts = savedDistrictValues
              .map((savedValue) => districtOptions.find((district) => [
                district.districtName,
                district.districtCode,
                district.districtId
              ].some((optionValue) => normalizeDistrictValue(optionValue) === normalizeDistrictValue(savedValue))))
              .filter(Boolean);

            return {
              stateCode: String(matchedState.stateCode),
              stateName: state.stateName,
              districtIds: matchedDistricts.map((district) => String(district.districtId)),
              districtCodes: matchedDistricts.map((district) => String(district.districtCode)),
              districtNames: savedDistrictValues.map((savedValue) => {
                const matched = districtOptions.find((district) => [
                  district.districtName,
                  district.districtCode,
                  district.districtId
                ].some((optionValue) => normalizeDistrictValue(optionValue) === normalizeDistrictValue(savedValue)));
                return matched?.districtName || savedValue;
              })
            };
          } catch (error) {
            console.error(`Error fetching districts for ${matchedState.stateName}:`, error);
            return {
              stateCode: String(matchedState.stateCode),
              stateName: state.stateName,
              districtIds: [],
              districtCodes: [],
              districtNames: (state.districts || []).map(getSavedDistrictValue).filter(Boolean)
            };
          }
        });

        const stateDistrictSelections = await Promise.all(stateDistrictSelectionsPromises);
        console.log("State District Selections:", stateDistrictSelections);
        setValue("stateDistrictSelections", stateDistrictSelections, { shouldDirty: false });
      } catch (error) {
        console.error("Error processing state district selections:", error);
      }
    };

    processStateDistrictSelections();
  }, [basicInfoData, states, setValue]);

  return (
    <>
      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h1" sx={sectionTitleSx}>
          1. Basic Scheme Information
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <FormField id="schemeName" label="1.1 Name of the Scheme" required>
            <TextField
              id="schemeName"
              placeholder="Name of the Scheme"
              fullWidth
              size="small"
              sx={readOnlyInputSx}
              slotProps={{ htmlInput: { readOnly: true } }}
              {...getFieldProps("schemeName", { required: "Scheme name is required." })}
            />
          </FormField>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h2" sx={sectionTitleSx}>
          2. Nodal Officer Details
        </Typography>
        {nodalOfficerLoading && <Typography role="status" sx={{ mb: 1, color: "text.secondary", fontSize: 12 }}>Loading nodal officer details...</Typography>}
        {nodalOfficerError && <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>{nodalOfficerError}</Typography>}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <FormField id="organizationName" label="2.1 Name of Implementing Agency" required>
            <TextField 
              id="organizationName" 
              fullWidth 
              size="small" 
              sx={readOnlyInputSx}
              slotProps={{ htmlInput: { readOnly: true } }}
              {...getFieldProps("organizationName", { required: "Implementing agency is required." })}
            />
          </FormField>
          <FormField id="officerName" label="2.2 Name of the Nodal Officer of Implementing Agency" required>
            <TextField
              id="officerName"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("officerName", {
                required: "Nodal officer name is required.",
                validate: (value) => Boolean(value.trim()) || "Nodal officer name is required."
              })}
            />
          </FormField>
          <FormField id="designation" label="2.3 Designation" required>
            <TextField
              id="designation"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("designation", {
                required: "Designation is required.",
                validate: (value) => Boolean(value.trim()) || "Designation is required."
              })}
            />
          </FormField>
          <FormField id="email" label="2.4 Email ID" required>
            <TextField
              id="email"
              type="email"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("email", {
                required: "Email address is required.",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." }
              })}
            />
          </FormField>
          <FormField id="mobile" label="2.5 Phone No" required>
            <TextField
              id="mobile"
              type="tel"
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("mobile", {
                required: "Phone number is required.",
                pattern: { value: /^[0-9]{10}$/, message: "Enter a 10-digit phone number." }
              })}
            />
          </FormField>
          <FormField id="aadhaarNumber" label="2.6 Aadhaar No." required>
            <TextField
              id="aadhaarNumber"
              type="password"
              placeholder="Enter 12-digit Aadhaar number"
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 12, autoComplete: "new-password" } }}
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("aadhaarNumber", {
                required: "Aadhaar number is required.",
                pattern: { value: /^[0-9]{12}$/, message: "Enter a 12-digit Aadhaar number." }
              })}
            />
          </FormField>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h2" sx={sectionTitleSx}>
          3. Scheme Details
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          <FormField id="dateOfProposal" label="3.1 Date of Proposal" required>
            <TextField
              id="dateOfProposal"
              type="date"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("dateOfProposal", { required: "Date of proposal is required." })}
            />
          </FormField>
          <FormField id="expectedCompletionDate" label="3.2 Expected Completion Date" required>
            <TextField
              id="expectedCompletionDate"
              type="date"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("expectedCompletionDate", { required: "Expected completion date is required." })}
            />
          </FormField>
          <FormField id="proposedFinancialOutlay" label="3.3 Proposed Financial Outlay (Rs)" required>
            <TextField
              id="proposedFinancialOutlay"
              type="text"
              inputProps={{ inputMode: "decimal" }}
              placeholder="Enter amount in rupees"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("proposedFinancialOutlay", {
                required: "Financial outlay is required.",
                valueAsNumber: true,
                validate: (value) => (
                  value === "" ||
                  (Number.isFinite(value) && value >= 0) ||
                  "Enter a valid non-negative amount."
                )
              })}
            />
          </FormField>
          <FormField id="schemeDuration" label="3.4 Scheme Duration">
            <TextField
              id="schemeDuration"
              placeholder="Scheme duration"
              fullWidth
              size="small"
              sx={readOnlyInputSx}
              slotProps={{ input: { readOnly: true } }}
              {...getFieldProps("schemeDuration")}
            />
          </FormField>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{ mb: 1.5, p: { xs: 2, md: 2.5 }, border: "1px solid #e0e4ea", borderRadius: 2, bgcolor: "#f9fafb" }}
      >
        <Typography component="h2" sx={sectionTitleSx}>
          4. Select state and district
        </Typography>
        {statesLoading && <Typography role="status" sx={{ mb: 1, color: "text.secondary", fontSize: 12 }}>Loading states...</Typography>}
        {statesError && <Typography role="alert" sx={{ mb: 1, color: "error.main", fontSize: 12 }}>{statesError}</Typography>}
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {stateDistrictFields.map((field, index) => {
            const otherSelectedStateCodes = stateDistrictSelections
              .filter((_, selectedIndex) => selectedIndex !== index)
              .map((selection) => String(selection?.stateCode || ""));
            return (
              <StateDistrictRow
                key={field.id}
                control={control}
                index={index}
                states={states}
                otherSelectedStateCodes={otherSelectedStateCodes}
                statesLoading={statesLoading}
                statesUnavailable={Boolean(statesError)}
                canRemove={stateDistrictFields.length > 1}
                onRemove={() => removeStateDistrict(index)}
              />
            );
          })}
        </Box>
        <Button
          type="button"
          variant="outlined"
          disabled={statesLoading || Boolean(statesError) || stateDistrictFields.length >= states.length}
          onClick={() => appendStateDistrict({
            stateCode: "",
            stateName: "",
            districtIds: [],
            districtCodes: [],
            districtNames: []
          })}
          sx={{ mt: 1.5, textTransform: "none", fontSize: 12 }}
        >
          Add another state and district
        </Button>
      </Paper>
    </>
  );
}

export default BasicInfoStep;