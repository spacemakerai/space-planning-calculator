import { Position } from "geojson";
import { PolygonGeometry } from "./fetchGeometryHook";
import { randomPoint } from "@turf/random";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import {
  transformRotate,
  transformTranslate,
  polygon,
  toWgs84,
  toMercator,
} from "@turf/turf";
import { Footprint } from "forma-embedded-view-sdk/dist/internal/geometry";

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

// use turf to generate random points within the site limit
const generateRandomPoints = (
  nPoints: number,
  siteLimit: Footprint
): Position[] => {
  const siteLimitPolygon = polygon([siteLimit.coordinates]);
  const xMin = siteLimit.coordinates.reduce(
    (acc, coord) => (coord[0] < acc ? coord[0] : acc),
    Infinity
  );
  const xMax = siteLimit.coordinates.reduce(
    (acc, coord) => (coord[0] > acc ? coord[0] : acc),
    -Infinity
  );
  const yMin = siteLimit.coordinates.reduce(
    (acc, coord) => (coord[1] < acc ? coord[1] : acc),
    Infinity
  );
  const yMax = siteLimit.coordinates.reduce(
    (acc, coord) => (coord[1] > acc ? coord[1] : acc),
    -Infinity
  );
  const siteLimitBbox = [xMin, yMin, xMax, yMax] as [
    number,
    number,
    number,
    number
  ];
  // check if point is within the site limit
  let points: Position[] = [];
  randomPoint(nPoints, { bbox: siteLimitBbox }).features.forEach((point) => {
    const isPointWithinSiteLimit = booleanPointInPolygon(
      point.geometry.coordinates,
      siteLimitPolygon
    );
    if (isPointWithinSiteLimit) {
      points.push(point.geometry.coordinates as Position);
    }
  });

  return points;
};

export const sampleOptionFromSiteLimit = (
  siteLimit: Footprint,
  // constraints: PolygonGeometry[],
  // spaceBetweenBuildings: number,
  widthRange: [number, number],
  heightRange: [number, number],
  numberOfBuildings: number
): Option => {
  const locations = generateRandomPoints(numberOfBuildings, siteLimit);
  let widths: number[] = [];
  let heights: number[] = [];
  let angles: number[] = [];
  let polygonGeometries: PolygonGeometry[] = [];

  for (let i = 0; i < locations.length; i++) {
    const width =
      Math.random() * (widthRange[1] - widthRange[0]) + widthRange[0];
    const height =
      Math.random() * (heightRange[1] - heightRange[0]) + heightRange[0];
    const location = locations[i];
    const angle = Math.random() * 360;

    // generate building polygonGeometry from width, height, location, angle
    const poly = polygon([
      [
        [-height / 2 + location[0], -width / 2 + location[1]],
        [-height / 2 + location[0], width / 2 + location[1]],
        [height / 2 + location[0], width / 2 + location[1]],
        [height / 2 + location[0], -width / 2 + location[1]],
        [-height / 2 + location[0], -width / 2 + location[1]],
      ],
    ]);

    const polyTransformed = polygon([
      poly.geometry.coordinates[0].map((point) => toWgs84(point)),
    ]);

    const rotatedPoly = transformRotate(polyTransformed, angle);
    const reTransformedPoly = polygon([
      rotatedPoly.geometry.coordinates[0].map((point) => toMercator(point)),
    ]);
    // tranlate coords to location
    const polygonGeometry = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: reTransformedPoly.geometry,
          properties: {},
        },
      ],
    };
    widths.push(width);
    heights.push(height);
    angles.push(angle);
    polygonGeometries.push(polygonGeometry as PolygonGeometry);
  }

  return {
    designVariables: {
      widths,
      heights,
      locations,
      angles,
    },
    buildings: polygonGeometries,
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
