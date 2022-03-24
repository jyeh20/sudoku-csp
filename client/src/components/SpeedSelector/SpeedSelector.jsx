import React from "react";

import "./SpeedSelector.css";

const SpeedSelector = (props) => {
  const { currentSpeed, setSpeed } = props;

  return (
    <div className="SpeedSelector">
      <input
        type="number"
        className="SpeedSelector-input"
        value={currentSpeed}
      />
    </div>
  );
};

export default SpeedSelector;
