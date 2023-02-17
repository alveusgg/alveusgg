export function getEntityStatus(entry: {
  deletedAt: null | Date;
  approvedAt: null | Date;
  updatedAt: Date;
}) {
  if (entry.deletedAt !== null) {
    return "deleted";
  }

  if (entry.approvedAt && entry.approvedAt >= entry.updatedAt) {
    return "approved";
  }

  return "pendingApproval";
}
