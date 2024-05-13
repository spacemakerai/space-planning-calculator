import { Forma } from "forma-embedded-view-sdk/auto";

type Feature = {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
};

export type GeoJSON = {
  type: string;
  features: Feature[];
};

export async function fetchConstraintsFootprints(constraintsPaths: string[]) {
  const constraints = await Promise.all(
    constraintsPaths.map(async (path) => {
      const { element } = await Forma.elements.getByPath({ path });
      const footprint = await Forma.elements.representations.footprint(element);
      if (!footprint) return;
      return footprint.data;
    })
  );
  return constraints.filter((c) => c !== undefined) as GeoJSON[];
}

export async function fetchSiteLimitFootprint(
  siteLimitPath: string | undefined
) {
  if (!siteLimitPath) return;
  const { element } = await Forma.elements.getByPath({
    path: siteLimitPath,
  });
  const footprint = await Forma.elements.representations.footprint(element);
  if (!footprint) return;
  return footprint.data as GeoJSON;
}
