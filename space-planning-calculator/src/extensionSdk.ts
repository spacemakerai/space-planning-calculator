import { Forma } from "forma-embedded-view-sdk/auto";

export async function getConstraints() {
  const constraintsPaths = await Forma.geometry.getPathsByCategory({
    category: "constraints",
  });
  console.log(constraintsPaths);
  return constraintsPaths;
}
