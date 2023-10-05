import React from "react";

function TextInput(props) {
  return (
    <div>
      test
      <label htmlFor={props.id}>{props.label}</label>
      <input
        type="text"
        id={props.id}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}

export default TextInput;