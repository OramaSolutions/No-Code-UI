
import Slider from "rc-slider";

export const SliderRow = ({ title, min, max, step, value, onChange }) => (
  <div className="RangeArea">
    <h1>{title}</h1>
    <div className="RangeBox">
      <div className="RangeHeading">
        <label>Min. Val</label>
        <label>Max. Val</label>
      </div>
      <div className="slider-container">
        <Slider min={min} max={max} step={step} value={value} onChange={onChange} className="custom-slider" />
        <div className="slider-value" style={{ left: `${((value - min) / (max - min)) * 100}%` }}>
          {Number.isInteger(step) ? value : value?.toFixed(1)}
        </div>
      </div>
    </div>
  </div>
);