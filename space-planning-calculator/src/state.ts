import { atom } from "recoil";
import { PolygonGeometry } from "./fetchGeometryHook";

export const optionState = atom<PolygonGeometry[]>({
  key: "optionState",
  default: [],
});
