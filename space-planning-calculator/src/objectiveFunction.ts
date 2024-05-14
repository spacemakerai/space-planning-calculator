import {
  Feature,
  MultiPolygon,
  Polygon,
  Properties,
  area,
  booleanContains,
  intersect,
  polygon,
  union,
} from "@turf/turf";
import { PolygonGeometry } from "./fetchGeometryHook";

export function getObjectiveFunctionValueForBuilding(
  building: PolygonGeometry,
  siteLimit: Feature<Polygon, Properties>,
  otherBuildings: PolygonGeometry[],
  constraints: Feature<Polygon, Properties>[]
) {
  // Determine overlap with constraints
  const buildingPolygon = building.features[0];
  const constraintsOverlap =
    constraints.reduce((acc, constraint) => {
      const constraintPolygon = constraint;
      const intersectingPolygon = intersect(buildingPolygon, constraintPolygon);
      if (!intersectingPolygon) return acc;
      return area(intersectingPolygon);
    }, 0) / area(buildingPolygon);

  // Determine if the building is within the site limit
  const containedBySiteLimit = booleanContains(siteLimit, buildingPolygon);
  const siteLimitContainmentValue = containedBySiteLimit ? 0 : 1;

  // Determine overlap with other buildings - within the margin of spaceBetweenBuildings
  const otherBuildingsOverlap =
    otherBuildings.reduce((acc, otherBuilding) => {
      const otherBuildingPolygon = otherBuilding.features[0];
      const intersectingPolygon = intersect(
        buildingPolygon,
        otherBuildingPolygon
      );
      if (!intersectingPolygon) return acc;
      return area(intersectingPolygon);
    }, 0) / area(buildingPolygon);

  return constraintsOverlap + siteLimitContainmentValue + otherBuildingsOverlap;
}

const getLandUtilizationFactor = (
  buildings: PolygonGeometry[],
  siteLimit: Feature<Polygon, Properties>,
  landUtilizationRatioTarget: number
) => {
  let combinedBuildingPolygon = polygon([]) as Feature<
    Polygon | MultiPolygon,
    Properties
  >;
  for (const building of buildings) {
    combinedBuildingPolygon = union(
      combinedBuildingPolygon,
      building.features[0]
    ) as Feature<Polygon | MultiPolygon, Properties>;
  }
  const landUtilization = intersect(siteLimit, combinedBuildingPolygon);
  if (!landUtilization) return 1;
  const landUtilizationRatio = area(landUtilization) / area(siteLimit);
  return Math.abs(landUtilizationRatio - landUtilizationRatioTarget);
};

export function getObjectiveFunctionValue(
  buildings: PolygonGeometry[],
  siteLimit: Feature<Polygon, Properties>,
  constraints: Feature<Polygon, Properties>[],
  spaceBetweenBuildings: number,
  landUtilizationRatio: number
) {
  const totalObjectiveValue = buildings.reduce((acc, building, index) => {
    const otherBuildings = buildings.slice(index + 1);
    const objectiveValue = getObjectiveFunctionValueForBuilding(
      building,
      siteLimit,
      otherBuildings,
      constraints
    );
    return acc + objectiveValue;
  }, 0);

  const landUtilizationFactor = getLandUtilizationFactor(
    buildings,
    siteLimit,
    landUtilizationRatio
  );

  return totalObjectiveValue + landUtilizationFactor;
}
