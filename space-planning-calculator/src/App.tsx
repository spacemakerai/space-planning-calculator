import { useEffect, useState } from "react";
import "./App.css";
import { getConstraints } from "./extensionSdk";

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

const SingleHandleSlider = (props: { label: string, min: number, max: number, unit: string }) => {
  const [value, setValue] = useState(Math.round(props.min+props.max)/2);

  const onValueChange = (event: CustomEvent) => {
    // @ts-ignore
    setValue(event.nativeEvent.detail);
  };

  return (
    <div style={{ textAlign: "left", padding: "16px 0" }}>
      <weave-slider
        value={value}
        min={props.min}
        max={props.max}
        variant="discrete"
        step={1}
        showlabel={true}
        label={props.label}
        onInput={onValueChange}
      ></weave-slider>
      <div>
        <span>{value}{props.unit}</span>
      </div>
    </div>
  );
};

const DoubleHandleSlider = (props: { label: string }) => {
  const [value, setValue] = useState(5);
  const [valueTo, setValueTo] = useState(20);

  const onValueChange = (event: CustomEvent) => {
    // @ts-ignore
    setValue(event.nativeEvent.detail.from);
    // @ts-ignore
    setValueTo(event.nativeEvent.detail.to);
  };

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
        // onChange={onValueChange}
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

function App() {
  const [constraints, setConstraints] = useState<string[]>([]);

  useEffect(() => {
    const fetchConstraints = async () => {
      const currentConstraints = await getConstraints();
      setConstraints(currentConstraints);
    };
    fetchConstraints();
  }, []);

  console.log(constraints);

  return (
    <div className="App">
      <h1>Space Planning Calculator</h1>
      <DoubleHandleSlider label={"Width range"} />
      <DoubleHandleSlider label={"Height range"} />
      <SingleHandleSlider label={"Land optimization ratio"} min={0} max={100} unit={"%"}/>
      <SingleHandleSlider label={"Space between buildings"} min={0} max={20} unit="m" />
      <div style={{ width: "100%", paddingTop: "24px"}}>
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
