export const UNASSIGNED_CREATOR = "Unassigned";
export const UNASSIGNED_KOL = "Awaiting match";

export function isUnassignedCreator(name: string) {
  return name === UNASSIGNED_CREATOR;
}
