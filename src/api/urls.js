const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const campaApiBaseUrl = `${apiBaseUrl}/campa`;
const afterLoginBaseUrl = `${apiBaseUrl}/mis`;

export const apiUrls = {
  activeSchemes: `${campaApiBaseUrl}/active-schemes`,
  schemeDetails: (schemeId) => `${campaApiBaseUrl}/${encodeURIComponent(schemeId)}/details`,
  roles: `${campaApiBaseUrl}/getAllRoles`,
  programDivisionOrganizations: `${campaApiBaseUrl}/program-division-organizations`,
  states: `${campaApiBaseUrl}/states`,
  registrationDropdownMetadata: `${campaApiBaseUrl}/dropdown-metadata`,
  //post apis
  registrationDistricts: (stateCode) => `${campaApiBaseUrl}/districts/${encodeURIComponent(stateCode)}`,
  misObjectives: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/objective-details`,
  misDeliverables: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/deliverables`,
  misEvaluationResearch: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/evaluation-research`,
  misDocumentDetails: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/document-details`,
  misTechExit: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/tech-exit`,
  misBankDetails: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/bank-details`,
  misGeneratePdf: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/generate-pdf`,
  misFinalDocuments: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/final-documents`,
  misEcGbDecision: (schemeId) => `${afterLoginBaseUrl}/ec-gb-decision/${encodeURIComponent(schemeId)}`,
  registerStateHod: `${afterLoginBaseUrl}/register-stateHod`,
  updateRoleStatus: `${afterLoginBaseUrl}/updateRoleStatus`,
  nodalOfficer: `${afterLoginBaseUrl}/basic-info`,
  //get apis
  basicInfo: (schemeId) => `${afterLoginBaseUrl}/basic-info/${encodeURIComponent(schemeId)}`,
  objectives: (schemeId) => `${afterLoginBaseUrl}/objectives/${encodeURIComponent(schemeId)}`,
  deliverables: (schemeId) => `${afterLoginBaseUrl}/deliverables/${encodeURIComponent(schemeId)}`,
  evaluationResearch: (schemeId) => `${afterLoginBaseUrl}/evaluation-research/${encodeURIComponent(schemeId)}`,
  techExit: (schemeId) => `${afterLoginBaseUrl}/tech-exit/${encodeURIComponent(schemeId)}`,
  documentDetails: (schemeId) => `${afterLoginBaseUrl}/document-details/${encodeURIComponent(schemeId)}`,
  bankDetails: (schemeId) => `${afterLoginBaseUrl}/bank-details/${encodeURIComponent(schemeId)}`,
  finalDocuments: (schemeId) => `${afterLoginBaseUrl}/final-documents/${encodeURIComponent(schemeId)}`,
  gbDecision: (schemeId) => `${afterLoginBaseUrl}/gb-decision/${encodeURIComponent(schemeId)}`,
  stateHodStatus: (schemeId) => `${afterLoginBaseUrl}/hod-status/${encodeURIComponent(schemeId)}`,
  getListingProposalById: (schemeId) => `${afterLoginBaseUrl}/getListingProposalById/${encodeURIComponent(schemeId)}`,
  schemeRoleStatusById: (schemeId) => `${afterLoginBaseUrl}/schemeRoleStatusByID/${encodeURIComponent(schemeId)}`,
  ///////////////////////////////////////
  register: `${campaApiBaseUrl}/register`,
  forgotPassword: `${campaApiBaseUrl}/forgot-password`,
  verifyResetOtp: `${campaApiBaseUrl}/verify-reset-otp`,
  resetPassword: `${campaApiBaseUrl}/reset-password`,
  misLogin: `${campaApiBaseUrl}/mis/login`,
  pariveshLogin: `${campaApiBaseUrl}/parivesh/login`
};
