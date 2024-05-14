import "./App.css";
import {
  getConstraintsPaths,
  getSiteLimitsPaths,
  renderGeoJSONs,
} from "./extensionSdk";
import {
  fetchConstraintsFootprints,
  fetchSiteLimitFootprint,
} from "./fetchGeometryHook";
import { InputParametersType } from "./type";
import { DoubleHandleSlider, SingleHandleSlider } from "./components/sliders";
import { useCallback, useEffect, useState } from "react";
import { optimize } from "./geneticAlgorithm";
import { Footprint } from "forma-embedded-view-sdk/dist/internal/geometry";
import { Darwin } from "charles.darwin";
import { polygon } from "@turf/turf";
import { generateOptionFromNormalizedChromosome } from "./generativeDesignEngine";
import { getObjectiveFunctionValue } from "./objectiveFunction";
import { Forma } from "forma-embedded-view-sdk/auto";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "weave-slider": {
        value: number;
        valueto?: number;
        min: number;
        max: number;
        step: number;
        variant: "discrete" | "continuous";
        label: string;
        showlabel?: boolean;
        // onChange: (event: CustomEvent) => void;
        onInput: (event: CustomEvent) => void;
      };
      "weave-progress-bar": {
        "percent-complete"?: number;
      };
      "weave-button": {
        // children component
        children: React.ReactNode;
        label: string;
        type: "button" | "submit" | "reset";
        variant: "solid" | "flat";
        onClick: () => void;
        disabled?: boolean;
      };
    }
  }
}

const ParametersInput = (props: {
  inputParameters: InputParametersType;
  setInputParameters: (inputParameters: InputParametersType) => void;
}) => {
  const { inputParameters, setInputParameters } = props;
  return (
    <>
      <DoubleHandleSlider
        label={"Width range"}
        range={inputParameters.widthRange}
        onChange={(value: [number, number]) => {
          setInputParameters({ ...inputParameters, widthRange: value });
        }}
      />
      <DoubleHandleSlider
        label={"Height range"}
        range={inputParameters.heightRange}
        onChange={(value: [number, number]) => {
          setInputParameters({ ...inputParameters, heightRange: value });
        }}
      />
      <SingleHandleSlider
        label={"Land optimization ratio"}
        min={0}
        max={100}
        unit={"%"}
        value={inputParameters.landOptimizationRatio}
        onChange={(value: number) => {
          setInputParameters({
            ...inputParameters,
            landOptimizationRatio: value,
          });
        }}
      />
      <SingleHandleSlider
        label={"Space between buildings"}
        min={0}
        max={20}
        unit="m"
        value={inputParameters.spaceBetweenBuildings}
        onChange={(value: number) => {
          setInputParameters({
            ...inputParameters,
            spaceBetweenBuildings: value,
          });
        }}
      />
    </>
  );
};

function App() {
  const [constraints, setConstraints] = useState<Footprint[]>([]);
  const [siteLimit, setSiteLimit] = useState<Footprint | undefined>();

  const [inputParameters, setInputParameters] = useState<InputParametersType>({
    widthRange: [0, 50],
    heightRange: [0, 50],
    landOptimizationRatio: 50,
    spaceBetweenBuildings: 0,
  });

  useEffect(() => {
    const fetchConstraints = async () => {
      const constraintsPaths = await getConstraintsPaths();
      const constraintsGeojson = await fetchConstraintsFootprints(
        constraintsPaths
      );
      setConstraints(constraintsGeojson);
    };
    fetchConstraints();
  }, []);

  useEffect(() => {
    const fetchSiteLimit = async () => {
      const siteLimitPaths = await getSiteLimitsPaths();
      const siteLimitFootprint = await fetchSiteLimitFootprint(siteLimitPaths);
      setSiteLimit(siteLimitFootprint);
    };
    fetchSiteLimit();
  }, []);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onClick = useCallback(async () => {
    if (siteLimit) {
      setIsLoading((prev) => !prev);
      const numberOfBuildings = 10;
      const numberOfChromosomes = numberOfBuildings * 5;
      const populationSize = 1000;
      const iterations = 50;

      // positions, then heights, then widths, then angles => 5 * numberOfBuildings

      const population = new Darwin<number>({
        populationSize: populationSize,
        chromosomeLength: numberOfChromosomes,
        randomGene: () => Math.random(),
      });

      const siteLimitPolygon = polygon([siteLimit.coordinates]);
      const constraintPolygons = constraints.map((constraint) =>
        polygon([constraint.coordinates])
      );

      const evalFitness = (chromosome: number[]) => {
        const option = generateOptionFromNormalizedChromosome(
          chromosome,
          siteLimit,
          inputParameters.widthRange,
          inputParameters.heightRange,
          numberOfBuildings
        );

        const fitness = getObjectiveFunctionValue(
          option,
          siteLimitPolygon,
          constraintPolygons,
          inputParameters.spaceBetweenBuildings,
          inputParameters.landOptimizationRatio
        );

        return fitness;
      };

      for (let i = 0; i < iterations; i++) {
        population.updateFitness((genes) => evalFitness(genes));
        population.mate();
        const option = generateOptionFromNormalizedChromosome(
          population.getTopChromosomes(1)[0].getGenes(),
          siteLimit,
          inputParameters.widthRange,
          inputParameters.heightRange,
          numberOfBuildings
        );
        await Forma.render.cleanup();
        await renderGeoJSONs(option);
        console.log(population.getStats());
      }

      const bestChromosome = population.getTopChromosomes(1);
      const resultOption = generateOptionFromNormalizedChromosome(
        bestChromosome[0].getGenes(),
        siteLimit,
        inputParameters.widthRange,
        inputParameters.heightRange,
        numberOfBuildings
      );

      await renderGeoJSONs(resultOption);
    }
  }, [setIsLoading, constraints, siteLimit, inputParameters]);

  return (
    <div className="App">
      <h1>Space Planning Calculator</h1>
      <ParametersInput
        inputParameters={inputParameters}
        setInputParameters={setInputParameters}
      />
      <div style={{ width: "100%", padding: "24px 0" }}>
        <weave-button
          label="Calculate"
          type="button"
          variant="solid"
          onClick={() => {
            onClick();
            setIsLoading(false);
          }}
          disabled={isLoading}
        >
          Calculate
        </weave-button>
        {isLoading && (
          <div style={{ width: "100%", padding: "24px 0" }}>
            <weave-progress-bar />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
