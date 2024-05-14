import { area, intersect, polygon } from "@turf/turf";
import { PolygonGeometry } from "./fetchGeometryHook";

/** 
export function getObjectiveFunctionValue(
  building: PolygonGeometry,
  siteLimit: PolygonGeometry,
  otherBuildings: PolygonGeometry[],
  constraints: PolygonGeometry[],
  spaceBetweenBuildings: number,
  landOptimizationRatio: number
) {
  // Determine overlap with constraints
  // Determine if the building is within the site limit
  // Determine overlap with other buildings - within the margin of spaceBetweenBuildings
  // Determine land optimization ratio
  const buildingPolygon = polygon(building.coordinates);
  const buildingIntersectionArea = otherBuildings.reduce(
    (acc, otherBuilding) => {
      return acc + area(intersect(building, otherBuilding));
    },
    0
  );
}
*/
