import { Forma } from "forma-embedded-view-sdk/auto";
import { Footprint } from "forma-embedded-view-sdk/dist/internal/geometry";
import { FeatureCollection, Polygon, GeoJsonProperties } from "geojson";

export type PolygonGeometry = FeatureCollection<Polygon, GeoJsonProperties>;

export async function fetchConstraintsFootprints(constraintsPaths: string[]) {
  const constraints = await Promise.all(
    constraintsPaths.map(async (path) => {
      const footprint = await Forma.geometry.getFootprint({ path });
      if (!footprint) return;
      return footprint;
    })
  );
  return constraints.filter((c) => c !== undefined) as Footprint[];
}

export async function fetchSiteLimitFootprint(
  siteLimitPath: string | undefined
) {
  if (!siteLimitPath) return;
  const footprint = await Forma.geometry.getFootprint({ path: siteLimitPath });
  if (!footprint) return;
  return footprint;
}
