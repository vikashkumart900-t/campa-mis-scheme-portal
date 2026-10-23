const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const campaApiBaseUrl = `${apiBaseUrl}/campa`;

export const apiUrls = {
  activeSchemes: `${campaApiBaseUrl}/active-schemes`,
  schemeDetails: (schemeId) => `${campaApiBaseUrl}/${encodeURIComponent(schemeId)}/details`,
  registrationDropdownMetadata: `${campaApiBaseUrl}/dropdown-metadata`,
  registrationDistricts: (stateCode) => `${campaApiBaseUrl}/districts/${encodeURIComponent(stateCode)}`,
  nodalOfficerRegistration: `${campaApiBaseUrl}/nodal-officer`,
  login: `${campaApiBaseUrl}/login`
};
