import { useEffect, useState } from "react";
import "./App.css";
import { getConstraints } from "./extensionSdk";
import { InputParametersType } from "./type";
import { DoubleHandleSlider, SingleHandleSlider } from "./components/sliders";

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
  const [constraints, setConstraints] = useState<string[]>([]);
  const [inputParameters, setInputParameters] = useState<InputParametersType>({
    widthRange: [0, 50],
    heightRange: [0, 50],
    landOptimizationRatio: 50,
    spaceBetweenBuildings: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const mockFetch = async (): Promise<any> => {
    // Mocked data
    const data = {};
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(data);
        setIsLoading(false);
      }, 5000);
    });
  };

  useEffect(() => {
    const fetchConstraints = async () => {
      const currentConstraints = await getConstraints();
      setConstraints(currentConstraints);
    };
    fetchConstraints();
  }, []);

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
            setIsLoading(true);
            mockFetch().then((data) => {
              setIsLoading(false);
            });
          }}
          disabled={isLoading}
        >
          Calculate
        </weave-button>
        {isLoading && (
          <div style={{ width: "100%", padding: "24px 0" }}>
            {" "}
            <weave-progress-bar />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
