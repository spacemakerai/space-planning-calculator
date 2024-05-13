import { Forma } from "forma-embedded-view-sdk/auto";

export async function getConstraintsPaths() {
  const constraintsPaths = await Forma.geometry.getPathsByCategory({
    category: "constraints",
  });
  return constraintsPaths;
}

export async function getSiteLimitsPaths() {
  const siteLimitsPaths = await Forma.geometry.getPathsByCategory({
    category: "site_limit",
  });
  if (!siteLimitsPaths) return undefined;
  return siteLimitsPaths[0];
}
