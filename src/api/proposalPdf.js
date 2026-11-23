import { apiUrls } from "./urls";

export async function fetchProposalPdf(schemeId) {
  const selectedSchemeId = Number(schemeId);
  if (!Number.isSafeInteger(selectedSchemeId) || selectedSchemeId <= 0) {
    throw new Error("The selected scheme is missing a valid scheme ID.");
  }

  const accessToken = sessionStorage.getItem("campaJwt")?.trim();
  if (!accessToken || accessToken.toLowerCase() === "authenticated") {
    throw new Error("Your session is missing an access token. Please sign in again.");
  }

  const authorization = /^Bearer\s/i.test(accessToken) ? accessToken : `Bearer ${accessToken}`;
  const response = await fetch(apiUrls.misGeneratePdf(selectedSchemeId), {
    headers: { Authorization: authorization }
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(responseText || `Unable to generate PDF (status ${response.status}).`);
  }

  const blob = await response.blob();
  if (!blob.size) {
    throw new Error("The PDF service returned an empty file.");
  }
  return blob;
}

export async function openProposalPdfPreview(schemeId) {
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    throw new Error("Your browser blocked the PDF preview window. Please allow pop-ups and try again.");
  }

  try {
    const blob = await fetchProposalPdf(schemeId);
    const objectUrl = URL.createObjectURL(blob);
    previewWindow.location.href = objectUrl;
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    if (!previewWindow.closed) previewWindow.close();
    throw error;
  }
}
