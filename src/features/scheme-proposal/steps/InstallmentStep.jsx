import { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import { proposalSteps } from "../config/proposalSteps";
import { getFinancialYears } from "../utils/financialYears";

const sectionSx = {
  p: { xs: 2, md: 2.5 },
  border: "1px solid #e0e4ea",
  borderRadius: 2,
  bgcolor: "#f9fafb"
};
const inputSx = {
  "& .MuiInputBase-root": { bgcolor: "#fff", fontSize: 12 },
  "& .MuiInputBase-input": { py: 1 },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#dce2e8" }
};
const readOnlyInputSx = {
  ...inputSx,
  "& .MuiInputBase-root": { ...inputSx["& .MuiInputBase-root"], bgcolor: "#f1f3f5" },
  "& .MuiInputBase-input": { ...inputSx["& .MuiInputBase-input"], color: "#667085", cursor: "not-allowed" }
};
const labelSx = {
  display: "block",
  mb: 0.5,
  color: "#344457",
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase"
};
const headerCellSx = {
  px: 1,
  py: 1,
  bgcolor: "#111",
  color: "#fff",
  borderRight: "1px solid #ffffff30",
  fontSize: 9,
  fontWeight: 700,
  textTransform: "uppercase"
};
const tableCellSx = {
  px: 0.75,
  py: 0.75,
  borderRight: "1px solid #e0e4ea",
  verticalAlign: "middle"
};
const bankFieldNames = [
  "accountName",
  "bankName",
  "ifscCode",
  "branchNameAddress",
  "accountNumber",
  "confirmAccountNumber"
];

function InstallmentStep() {
  const {
    control,
    getValues,
    register,
    setError,
    clearErrors,
    trigger,
    watch,
    formState: { errors }
  } = useFormContext();
  const { fields, replace } = useFieldArray({ control, name: "installment.installments" });
  const dateOfProposal = watch("dateOfProposal");
  const expectedCompletionDate = watch("expectedCompletionDate");
  const schemeName = watch("schemeName");
  const proposedFinancialOutlay = watch("proposedFinancialOutlay");
  const installmentRows = watch("installment.installments") || [];
  const financialYears = getFinancialYears(dateOfProposal, expectedCompletionDate);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const currentRows = getValues("installment.installments") || [];
    const nextRows = getFinancialYears(dateOfProposal, expectedCompletionDate).map((financialYear, index) => {
      const currentRow = currentRows.find((row) => row.financialYear === financialYear);
      return currentRow || {
        financialYear,
        installmentNumber: index + 1,
        duration: "",
        amount: ""
      };
    }).map((row, index) => ({ ...row, installmentNumber: index + 1 }));
    const rowsMatch = currentRows.length === nextRows.length
      && currentRows.every((row, index) => row.financialYear === nextRows[index].financialYear);
    if (!rowsMatch) replace(nextRows);
    if (nextRows.length) clearErrors("installment.installments");
  }, [clearErrors, dateOfProposal, expectedCompletionDate, getValues, replace]);

  const totalAmount = proposedFinancialOutlay === "" || proposedFinancialOutlay === undefined
    || !Number.isFinite(Number(proposedFinancialOutlay))
    ? ""
    : proposedFinancialOutlay;
  const registerField = (name, rules = {}) => register(name, {
    ...rules,
    onChange: () => setIsSaved(false)
  });
  const saveInstallments = async () => {
    setIsSaved(false);
    if (!financialYears.length) {
      setError("installment.installments", {
        type: "required",
        message: "Enter the proposal and expected completion dates to generate installment years."
      });
      return;
    }

    const fieldsToValidate = [
      ...installmentRows.flatMap((_, index) => [
        `installment.installments.${index}.duration`,
        `installment.installments.${index}.amount`
      ]),
      ...bankFieldNames.map((name) => `installment.bankDetails.${name}`)
    ];
    if (await trigger(fieldsToValidate)) setIsSaved(true);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5, pb: 1.5, borderBottom: "1px solid #e8d7a4" }}>
        <Box sx={{ width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #1b8d63", bgcolor: "#dfeee5", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#1b8d63" }} />
        </Box>
        <Typography component="h1" sx={{ fontSize: 14, fontWeight: 700, color: "#132e4c", lineHeight: 1.2 }}>
          Installment Report
        </Typography>
      </Box>

      <Typography sx={{ mb: 2, color: "#425162", fontSize: 12, lineHeight: 1.5 }}>
        Please provide the installments yet to be released (New) and the bank details.
      </Typography>

      <Paper elevation={0} sx={sectionSx}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5, mb: 1.5 }}>
          <Box>
            <Typography sx={labelSx}>Scheme Type</Typography>
            <TextField fullWidth size="small" value={schemeName || ""} sx={readOnlyInputSx} slotProps={{ input: { readOnly: true } }} />
          </Box>
          <Box>
            <Typography sx={labelSx}>Total Amount (in Rupees)</Typography>
            <TextField
              fullWidth
              size="small"
              value={totalAmount}
              sx={readOnlyInputSx}
              slotProps={{ input: { readOnly: true } }}
              aria-label="Total amount in rupees"
            />
          </Box>
        </Box>

        <Typography component="h2" sx={{ mb: 0.75, color: "#132e4c", fontSize: 12, fontWeight: 700 }}>
          New Installments
        </Typography>
        <TableContainer sx={{ mb: 2.5, border: "1px solid #e0e4ea", borderRadius: 1, bgcolor: "#fff" }}>
          <Table size="small" aria-label="New installments">
            <TableHead>
              <TableRow>
                {["Financial Year", "Installment No.", "Duration *", "Amount (in Lakh) *"].map((heading) => (
                  <TableCell key={heading} sx={headerCellSx}>{heading}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.length ? fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell sx={{ ...tableCellSx, minWidth: 130 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={installmentRows[index]?.financialYear || ""}
                      sx={inputSx}
                      slotProps={{ input: { readOnly: true } }}
                      aria-label={`Financial year for installment ${index + 1}`}
                    />
                  </TableCell>
                  <TableCell sx={{ ...tableCellSx, minWidth: 125 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={installmentRows[index]?.installmentNumber || index + 1}
                      sx={inputSx}
                      slotProps={{ input: { readOnly: true } }}
                      aria-label={`Installment number ${index + 1}`}
                    />
                  </TableCell>
                  <TableCell sx={{ ...tableCellSx, minWidth: 150 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Ex. 11 month"
                      sx={inputSx}
                      error={Boolean(errors?.installment?.installments?.[index]?.duration)}
                      helperText={errors?.installment?.installments?.[index]?.duration?.message}
                      {...registerField(`installment.installments.${index}.duration`, {
                        required: "Duration is required."
                      })}
                    />
                  </TableCell>
                  <TableCell sx={{ ...tableCellSx, minWidth: 170, borderRight: 0 }}>
                    <TextField
                      fullWidth
                      type="number"
                      size="small"
                      placeholder={`Amount for ${installmentRows[index]?.financialYear || field.financialYear}`}
                      sx={inputSx}
                      slotProps={{ htmlInput: { min: 0, step: "any" } }}
                      error={Boolean(errors?.installment?.installments?.[index]?.amount)}
                      helperText={errors?.installment?.installments?.[index]?.amount?.message}
                      {...registerField(`installment.installments.${index}.amount`, {
                        required: "Amount is required.",
                        setValueAs: (value) => value === "" ? "" : Number(value),
                        validate: (value) => Number.isFinite(Number(value)) && Number(value) >= 0 || "Enter a valid non-negative amount."
                      })}
                    />
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ py: 1.5, color: "#65758b", fontSize: 11 }}>
                    Enter the proposal and expected completion dates to generate installment years.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {errors?.installment?.installments?.message && (
          <FormHelperText error sx={{ mt: -2, mb: 1.5 }}>
            {errors.installment.installments.message}
          </FormHelperText>
        )}

        <Typography component="h2" sx={{ mb: 0.75, color: "#132e4c", fontSize: 12, fontWeight: 700 }}>
          Bank Details
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
          <FormControl error={Boolean(errors?.installment?.bankDetails?.accountName)}>
            <Typography component="label" sx={labelSx}>Account Name *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter account name"
              sx={inputSx}
              error={Boolean(errors?.installment?.bankDetails?.accountName)}
              helperText={errors?.installment?.bankDetails?.accountName?.message}
              {...registerField("installment.bankDetails.accountName", { required: "Account name is required." })}
            />
          </FormControl>
          <FormControl error={Boolean(errors?.installment?.bankDetails?.bankName)}>
            <Typography component="label" sx={labelSx}>Bank Name *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter bank name"
              sx={inputSx}
              error={Boolean(errors?.installment?.bankDetails?.bankName)}
              helperText={errors?.installment?.bankDetails?.bankName?.message}
              {...registerField("installment.bankDetails.bankName", { required: "Bank name is required." })}
            />
          </FormControl>
          <FormControl error={Boolean(errors?.installment?.bankDetails?.ifscCode)}>
            <Typography component="label" sx={labelSx}>IFSC Code *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Ex. SBIN0001234"
              sx={inputSx}
              error={Boolean(errors?.installment?.bankDetails?.ifscCode)}
              helperText={errors?.installment?.bankDetails?.ifscCode?.message}
              {...registerField("installment.bankDetails.ifscCode", {
                required: "IFSC code is required.",
                setValueAs: (value) => value.trim().toUpperCase(),
                validate: (value) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) || "Enter a valid 11-character IFSC code."
              })}
            />
          </FormControl>
          <FormControl sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }} error={Boolean(errors?.installment?.bankDetails?.branchNameAddress)}>
            <Typography component="label" sx={labelSx}>Branch Name &amp; Address *</Typography>
            <TextField
              fullWidth
              multiline
              minRows={2}
              placeholder="Enter branch name and address"
              sx={inputSx}
              error={Boolean(errors?.installment?.bankDetails?.branchNameAddress)}
              helperText={errors?.installment?.bankDetails?.branchNameAddress?.message}
              {...registerField("installment.bankDetails.branchNameAddress", { required: "Branch name and address are required." })}
            />
          </FormControl>
          <FormControl error={Boolean(errors?.installment?.bankDetails?.accountNumber)}>
            <Typography component="label" sx={labelSx}>Account Number *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter account number"
              sx={inputSx}
              error={Boolean(errors?.installment?.bankDetails?.accountNumber)}
              helperText={errors?.installment?.bankDetails?.accountNumber?.message}
              {...registerField("installment.bankDetails.accountNumber", {
                required: "Account number is required.",
                validate: (value) => Boolean(value.trim()) || "Account number is required."
              })}
            />
          </FormControl>
          <FormControl error={Boolean(errors?.installment?.bankDetails?.confirmAccountNumber)}>
            <Typography component="label" sx={labelSx}>Confirm Account Number *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Re-enter account number"
              sx={inputSx}
              error={Boolean(errors?.installment?.bankDetails?.confirmAccountNumber)}
              helperText={errors?.installment?.bankDetails?.confirmAccountNumber?.message}
              {...registerField("installment.bankDetails.confirmAccountNumber", {
                required: "Confirm account number is required.",
                validate: (value) => value.trim() === getValues("installment.bankDetails.accountNumber")?.trim()
                  || "Account numbers do not match."
              })}
            />
          </FormControl>
        </Box>

        <Box sx={{ mt: 1.75, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Button
            type="button"
            variant="contained"
            onClick={saveInstallments}
            sx={{ bgcolor: "#075b35", fontSize: 11, fontWeight: 700, textTransform: "none", "&:hover": { bgcolor: "#064a2b" } }}
          >
            Save Installments &amp; Bank Details
          </Button>
          {isSaved && (
            <Typography role="status" sx={{ color: "#087638", fontSize: 11 }}>
              Installments and bank details are saved in this form.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default InstallmentStep;
