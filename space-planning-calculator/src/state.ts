// recoil state building parameters

import { atom } from "recoil";

export type InputParametersType = {
  widthRange: [number, number];
  heightRange: [number, number];
  landOptimizationRatio: number;
  spaceBetweenBuildings: number;
};

export const inputParametersState = atom<InputParametersType>({
  key: "inputParametersState",
  default: {
    widthRange: [10, 20],
    heightRange: [10, 20],
    landOptimizationRatio: 50,
    spaceBetweenBuildings: 10,
  },
});
