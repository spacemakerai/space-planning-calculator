import { Forma } from "forma-embedded-view-sdk/auto";
import { PolygonGeometry } from "./fetchGeometryHook";
import * as THREE from "three";

export async function getConstraintsPaths() {
  const constraintsPaths = await Forma.geometry.getPathsByCategory({
    category: "constraints",
  });
  return constraintsPaths;
}

export async function getSiteLimitsPaths() {
  const siteLimitsPaths = await Forma.geometry.getPathsByCategory({
    category: "site_limit",
  });
  if (!siteLimitsPaths) return undefined;
  return siteLimitsPaths[0];
}

export async function renderGeoJSONs(geoJSONs: PolygonGeometry[]) {
  return await Promise.all(
    geoJSONs.map((geojson) => {
      const shape = new THREE.Shape(
        geojson.features[0].geometry.coordinates[0].map(
          (point) => new THREE.Vector2(point[0], point[1])
        )
      );
      const extrudeSettings = {
        steps: 1,
        depth: 20,
        bevelEnabled: true,
        bevelThickness: 1,
      };
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const mesh = new THREE.Mesh(geometry, material);
      const color = [];
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        color.push(211, 211, 211, 200);
      }

      Forma.render.addMesh({
        geometryData: {
          position: new Float32Array(
            mesh.geometry.getAttribute("position").array
          ),
          normal: new Float32Array(mesh.geometry.getAttribute("normal").array),
          color: new Uint8Array(color),
        },
      });
    })
  );
}
