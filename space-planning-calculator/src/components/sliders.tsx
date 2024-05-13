export const SingleHandleSlider = (props: {
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
  
export const DoubleHandleSlider = (props: {
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