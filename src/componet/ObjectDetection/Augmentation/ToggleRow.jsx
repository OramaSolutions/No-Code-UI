export const ToggleRow = ({ label, name, checked, onChange, tooltip }) => (
  <div className="form-group">
    <label className="CheckBox">
      {label}
      <img src={require("../../../assets/images/esclamination.png")} data-toggle="tooltip" title={tooltip} />
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="checkmark" />
    </label>
  </div>
);