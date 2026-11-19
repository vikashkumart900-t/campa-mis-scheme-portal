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
  registrationDistricts: (stateCode) => `${campaApiBaseUrl}/districts/${encodeURIComponent(stateCode)}`,
  misObjectives: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/objective-details`,
  misDeliverables: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/deliverables`,
  misEvaluationResearch: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/evaluation-research`,
  misDocumentDetails: (schemeId) => `${afterLoginBaseUrl}/${encodeURIComponent(schemeId)}/document-details`,
  register: `${campaApiBaseUrl}/register`,
  forgotPassword: `${campaApiBaseUrl}/forgot-password`,
  verifyResetOtp: `${campaApiBaseUrl}/verify-reset-otp`,
  resetPassword: `${campaApiBaseUrl}/reset-password`,
  nodalOfficer: `${afterLoginBaseUrl}/nodal-officer`,
  misLogin: `${campaApiBaseUrl}/mis/login`,
  pariveshLogin: `${campaApiBaseUrl}/parivesh/login`
};
