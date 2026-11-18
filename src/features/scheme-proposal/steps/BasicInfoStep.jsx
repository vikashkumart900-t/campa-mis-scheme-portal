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
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { apiUrls } from "../../../api/urls";

const selectAllDistrictsValue = "__select_all_districts__";

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
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext();
  const {
    fields: stateDistrictFields,
    append: appendStateDistrict,
    remove: removeStateDistrict
  } = useFieldArray({ control, name: "stateDistrictSelections" });
  const stateDistrictSelections = useWatch({ control, name: "stateDistrictSelections" }) || [];
  const [states, setStates] = useState([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [statesError, setStatesError] = useState("");

  const getFieldProps = (name, rules = {}) => {
    const fieldError = errors[name];
    return {
      ...register(name, rules),
      error: Boolean(fieldError),
      helperText: fieldError?.message
    };
  };

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
          <FormField id="officerName" label="2.2 Name of the Nodal Officer of Implementing Agency">
            <TextField id="officerName" fullWidth size="small" sx={inputSx} {...getFieldProps("officerName")} />
          </FormField>
          <FormField id="designation" label="2.3 Designation">
            <TextField id="designation" fullWidth size="small" sx={inputSx} {...getFieldProps("designation")} />
          </FormField>
          <FormField id="email" label="2.4 Email ID">
            <TextField
              id="email"
              type="email"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("email", {
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." }
              })}
            />
          </FormField>
          <FormField id="mobile" label="2.5 Phone No">
            <TextField
              id="mobile"
              type="tel"
              slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 10 } }}
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("mobile", {
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
          <FormField id="dateOfProposal" label="3.1 Date of Proposal">
            <TextField id="dateOfProposal" type="date" fullWidth size="small" sx={inputSx} {...getFieldProps("dateOfProposal")} />
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
              type="number"
              inputProps={{ min: 0, step: "any" }}
              placeholder="Enter amount in rupees"
              fullWidth
              size="small"
              sx={inputSx}
              {...getFieldProps("proposedFinancialOutlay", {
                required: "Financial outlay is required.",
                valueAsNumber: true,
                min: { value: 0, message: "Financial outlay cannot be negative." }
              })}
            />
          </FormField>
          <FormField id="schemeDuration" label="3.4 Scheme Duration">
            <TextField
              id="schemeDuration"
              placeholder="Enter duration (e.g., 5 years)"
              fullWidth
              size="small"
              sx={inputSx}
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