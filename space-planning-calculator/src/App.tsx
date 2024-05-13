import { useEffect, useState } from "react";
import "./App.css";
import { getConstraints } from "./extensionSdk";
import { useRecoilState } from "recoil";
import { inputParametersState } from "./state";

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
        "percent-complete": number;
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

const SingleHandleSlider = (props: {
  value: number;
  label: string;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) => {
  const onValueChange = (event: CustomEvent) => {
    // @ts-ignore
    props.onChange(event.nativeEvent.detail);
  };

  return (
    <div style={{ textAlign: "left", padding: "16px 0" }}>
      <weave-slider
        value={props.value}
        min={props.min}
        max={props.max}
        variant="discrete"
        step={1}
        showlabel={true}
        label={props.label}
        onInput={onValueChange}
      ></weave-slider>
      <div>
        <span>
          {props.value}
          {props.unit}
        </span>
      </div>
    </div>
  );
};

const DoubleHandleSlider = (props: {
  range: [number, number];
  label: string;
  onChange: (value: [number, number]) => void;
}) => {
  const onValueChange = (event: CustomEvent) => {
    props.onChange([
      // @ts-ignore
      event.nativeEvent.detail.from,
      // @ts-ignore
      event.nativeEvent.detail.to,
    ]);
  };
  const [value, valueTo] = props.range;
  return (
    <div style={{ textAlign: "left", padding: "16px 0" }}>
      <weave-slider
        value={value}
        valueto={valueTo}
        min={0}
        max={50}
        variant="discrete"
        step={1}
        showlabel={true}
        label={props.label}
        onInput={onValueChange}
      ></weave-slider>
      <div>
        <span>{value}m</span>
        <span> - </span>
        <span>{valueTo}m</span>
      </div>
    </div>
  );
};

const ParametersInput = () => {
  const [inputParameters, setInputParameters] =
    useRecoilState(inputParametersState);

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
      <ParametersInput />
      <div style={{ width: "100%", paddingTop: "24px" }}>
        <weave-button
          label="Calculate"
          type="button"
          variant="solid"
          onClick={() => {}}
        >
          Calculate
        </weave-button>
      </div>
    </div>
  );
}

export default App;
