import { Position } from "geojson";
import { PolygonGeometry } from "./fetchGeometryHook";
import {
  transformRotate,
  polygon,
  toWgs84,
  toMercator,
  Feature,
  Polygon,
  Properties,
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

export const generateOptionFromNormalizedChromosome = (
  chromosome: number[],
  siteLimit: Footprint,
  widhtRange: [number, number],
  heightRange: [number, number],
  numberOfBuildings: number
) => {
  const widths = chromosome
    .slice(0, numberOfBuildings)
    .map(
      (normalizedWidth) =>
        normalizedWidth * (widhtRange[1] - widhtRange[0]) + widhtRange[0]
    );
  const heights = chromosome
    .slice(numberOfBuildings, numberOfBuildings * 2)
    .map(
      (normalizedHeight) =>
        normalizedHeight * (heightRange[1] - heightRange[0]) + heightRange[0]
    );
  const angles = chromosome
    .slice(numberOfBuildings * 2, numberOfBuildings * 3)
    .map((normalizedAngle) => normalizedAngle * 360);

  const normalizedPositions = chromosome.slice(
    numberOfBuildings * 3,
    numberOfBuildings * 5
  );
  let positions: Position[] = [];

  for (let i = 0; i < numberOfBuildings; i++) {
    const normalizedPosition = [
      normalizedPositions[2 * i],
      normalizedPositions[2 * i + 1],
    ];
    const siteLimitBbox = getBboxFromFootprint(siteLimit);
    const x =
      normalizedPosition[0] * (siteLimitBbox.xMax - siteLimitBbox.xMin) +
      siteLimitBbox.xMin;
    const y =
      normalizedPosition[1] * (siteLimitBbox.yMax - siteLimitBbox.yMin) +
      siteLimitBbox.yMin;
    positions.push([x, y]);
  }

  return generateOption(widths, heights, angles, positions);
};

export const generateOption = (
  widths: number[],
  heights: number[],
  angles: number[],
  positions: Position[]
): PolygonGeometry[] => {
  // check lengths of arrays are different and throw error
  if (
    widths.length !== heights.length ||
    widths.length !== positions.length ||
    widths.length !== angles.length
  ) {
    throw new Error(
      "Widths, height, angles, and positions must have the same length"
    );
  }
  let polygonGeometries: PolygonGeometry[] = [];
  // generate buildings
  for (let i = 0; i < positions.length; i++) {
    const width = widths[i];
    const height = heights[i];
    const location = positions[i];

    const angle = angles[i];

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
    polygonGeometries.push(polygonGeometry as PolygonGeometry);
  }
  return polygonGeometries;
};

export const createFeatureCollection = (
  geometry: Feature<Polygon, Properties>
) => {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: geometry,
        properties: {},
      },
    ],
  };
};

function getBboxFromFootprint(siteLimit: Footprint) {
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
  const siteLimitBbox = { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax };
  return siteLimitBbox;
}
