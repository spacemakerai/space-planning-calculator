import { Position } from "geojson";
import { PolygonGeometry } from "./fetchGeometryHook";

export function generateOptions(
  siteLimit: PolygonGeometry,
  constraints: PolygonGeometry[],
  spaceBetweenBuildings: number = 3.0,
  width: number = 20,
  height: number = 20
): PolygonGeometry {
  console.log("Generating options");
  const coordinates = siteLimit.features[0].geometry
    .coordinates[0] as Position[];
  const xs = coordinates.map((c) => c[0]);
  const ys = coordinates.map((c) => c[1]);
  const meanX = xs.reduce((acc, x) => x + acc, 0) / xs.length;
  const meanY = ys.reduce((acc, y) => y + acc, 0) / ys.length;
  const rectangle = [
    [meanX - width / 2, meanY - height / 2],
    [meanX + width / 2, meanY - height / 2],
    [meanX + width / 2, meanY + height / 2],
    [meanX - width / 2, meanY + height / 2],
    [meanX - width / 2, meanY - height / 2],
  ];
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [rectangle],
        },
        properties: {},
      },
    ],
  };
}
