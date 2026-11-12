export const materialTypes = ["pvc", "taslan", "rubbery", "nilon"] as const;
export type MaterialType = (typeof materialTypes)[number];

export const materialLabel: Record<MaterialType, string> = {
  pvc: "PVC",
  taslan: "Taslan laminasi",
  rubbery: "Rubbery",
  nilon: "Nilon",
};

export function isMaterialType(value: string): value is MaterialType {
  return (materialTypes as readonly string[]).includes(value);
}
