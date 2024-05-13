import { Forma } from "forma-embedded-view-sdk/auto";
import { FeatureCollection, Polygon, GeoJsonProperties } from "geojson";

export type PolygonGeometry = FeatureCollection<Polygon, GeoJsonProperties>;

export async function fetchConstraintsFootprints(constraintsPaths: string[]) {
  const constraints = await Promise.all(
    constraintsPaths.map(async (path) => {
      const { element } = await Forma.elements.getByPath({ path });
      const footprint = await Forma.elements.representations.footprint(element);
      if (!footprint) return;
      return footprint.data;
    })
  );
  return constraints.filter((c) => c !== undefined) as PolygonGeometry[];
}

export async function fetchSiteLimitFootprint(
  siteLimitPath: string | undefined
) {
  if (!siteLimitPath) return;
  const { transform } = await Forma.elements.getWorldTransform({
    path: siteLimitPath,
  });
  const { element } = await Forma.elements.getByPath({
    path: siteLimitPath,
  });
  const footprint = await Forma.elements.representations.footprint(element);
  if (!footprint) return;
  const polygonGeometry = footprint.data as PolygonGeometry;
  const coordinates = applyTransform(
    transform,
    polygonGeometry.features[0].geometry.coordinates as number[][][]
  );
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates,
        },
        properties: {},
      },
    ],
  } as PolygonGeometry;
}

const applyTransform = (transform: number[], coordinates: number[][][]) => {
  return coordinates.map((polygon) => {
    return polygon.map(([x, y]) => {
      const x1 = transform[0] * x + transform[4] * y + transform[12];
      const y1 = transform[1] * x + transform[5] * y + transform[13];
      return [x1, y1];
    });
  });
};
