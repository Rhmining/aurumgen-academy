export const seededUniversalAccessEmails = ["dr.rachmat.hidayat@gmail.com"];

export function hasUniversalAccess(email?: string | null) {
  if (!email) return false;

  return seededUniversalAccessEmails.includes(email.trim().toLowerCase());
}

export function canManageAllAiDocuments(email?: string | null) {
  return hasUniversalAccess(email);
}
