import { Position } from "geojson";
import { PolygonGeometry } from "./fetchGeometryHook";

// 1. use input parameters to generate N random options (an option is a set of polygons/buildings)
// e.g. one option
// sample a number of buildings between 1 and 10 > simplifying by using fixed number of buildigns for now
// sample locations within the site limit for the
// sample a width and height for each building in the ranges provided
// repeat this process N times

// 2. evaluate each option
// for now, simple objective function
// as close as possible to utilization ratio > min(abs(area of all buildings in option / area of site limit - utilization))
// no overlap with constraint > min(area of overlap with constraints)
// obj func to min = abs(area of all buildings in option / area of site limit - utilization) + area of overlap with constraints
// probably need to add turf for polygon

type Option = {
  // designVariables are the result of the initial random sampling
  designVariables: {
    widths: number[];
    heights: number[];
    locations: Position[];
    angles: number[];
  };
  // the actual buildings generated
  buildings?: PolygonGeometry[];
  objectiveValue?: number;
};

const sampleOptionFromSiteLimit = (
  siteLimit: PolygonGeometry,
  constraints: PolygonGeometry[],
  spaceBetweenBuildings: number,
  widthRange: [number, number],
  heightRange: [number, number],
  numberOfBuildings: number
): Option => {
  return {
    designVariables: {
      widths: Array.from(
        { length: numberOfBuildings },
        () => Math.random() * (widthRange[1] - widthRange[0]) + widthRange[0]
      ),
      heights: Array.from(
        { length: numberOfBuildings },
        () => Math.random() * (heightRange[1] - heightRange[0]) + heightRange[0]
      ),
      locations: //TODO,
      angles: Array.from(
        { length: numberOfBuildings },
        () => Math.random() * 360
      ),
    },
  };
};

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
