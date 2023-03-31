const iucnStatuses = {
  EX: "Extinct",
  EW: "Extinct in the Wild",
  CR: "Critically Endangered",
  EN: "Endangered",
  VU: "Vulnerable",
  NT: "Near Threatened",
  LC: "Least Concern",
  DD: "Data Deficient",
  NE: "Not Evaluated",
} as const;

const iucnFlags = {
  increasing: "with increasing population trend",
  decreasing: "with decreasing population trend",
} as const;

type IUCNStatuses = keyof typeof iucnStatuses;
type ICUNFlags = keyof typeof iucnFlags;
export type IUCNStatus = IUCNStatuses | `${IUCNStatuses}/${ICUNFlags}`;

const isIUCNStatus = (str: string): str is IUCNStatuses =>
  Object.keys(iucnStatuses).includes(str as IUCNStatuses);

const isIUCNFlag = (str: string): str is ICUNFlags =>
  Object.keys(iucnFlags).includes(str as ICUNFlags);

export const getIUCNStatus = (fullStatus: IUCNStatus): string => {
  const [status, flag] = fullStatus.split("/");

  if (!status || !isIUCNStatus(status))
    throw new Error(`Invalid IUCN status: ${status}`);
  if (!flag) return iucnStatuses[status];

  if (!isIUCNFlag(flag)) throw new Error(`Invalid IUCN flag: ${flag}`);
  return `${iucnStatuses[status]} ${iucnFlags[flag]}`;
};
