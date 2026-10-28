const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/+$/, "");
const campaApiBaseUrl = `${apiBaseUrl}/campa`;

export const apiUrls = {
  activeSchemes: `${campaApiBaseUrl}/active-schemes`,
  schemeDetails: (schemeId) => `${campaApiBaseUrl}/${encodeURIComponent(schemeId)}/details`,
  roles: `${campaApiBaseUrl}/getAllRoles`,
  programDivisionOrganizations: `${campaApiBaseUrl}/program-division-organizations`,
  registrationDropdownMetadata: `${campaApiBaseUrl}/dropdown-metadata`,
  registrationDistricts: (stateCode) => `${campaApiBaseUrl}/districts/${encodeURIComponent(stateCode)}`,
  register: `${campaApiBaseUrl}/register`,
  misLogin: `${campaApiBaseUrl}/mis/login`,
  pariveshLogin: `${campaApiBaseUrl}/parivesh/login`
};
