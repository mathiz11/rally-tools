import React from "react";
import { Icon } from "semantic-ui-react";

const NumberInput = ({ title, value, plus, minus }) => {
  return (
    <div className="number-input">
      <h2>{title}</h2>
      <div className="number-input-content">
        <Icon name="minus circle" size="large" onClick={minus} />
        <span>{value}</span>
        <Icon name="plus circle" size="large" onClick={plus} />
      </div>
    </div>
  );
};

export default NumberInput;
