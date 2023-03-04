export function getEntityStatus(entry: {
  approvedAt: null | Date;
  updatedAt: Date;
}) {
  if (entry.approvedAt && entry.approvedAt >= entry.updatedAt) {
    return "approved";
  }

  return "pendingApproval";
}
