import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

// Create a new component to display the submitted text
function SubmittedText({ text }) {
  return (
    <details>
    <summary>Submitted text:</summary>
     {text}
  </details>
  );
}

export default function Home() {
  const [clauseInput, setClauseInput] = useState("");
  const [submittedText, setSubmittedText] = useState("");
  const [result, setResult] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clause: clauseInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setSubmittedText(clauseInput);
      setClauseInput("");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Review clause POC</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <h3>Review clause</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="clause"
            placeholder="Enter clause to review"
            value={clauseInput}
            onChange={(e) => setClauseInput(e.target.value)}
          />
          <input type="submit" value="Let's go" />
        </form>

        {/* Render the SubmittedText component with the submitted text */}
        {submittedText && <SubmittedText text={submittedText} />}

        <details>
          <summary>API Response:</summary>
          <div className={styles.result}>{result}</div>
        </details>

        {/* Render ResultComponent with the result prop */}
        <ResultComponent result={result} />
      </main>
    </div>
  );
}

// Define a component that takes the result as a prop
function ResultComponent({ result }) {
  if (result && typeof result === "string") {
    try {
      const data = JSON.parse(result);

      return (
        <div>
          {data.parameters.map((uiControl, index) => {
            switch (uiControl.uiControl) { // Change 'type' to 'uiControl'
              case 'textInput':
                return <TextInputComponent key={index} uiControl={uiControl} />;
              case 'selectMenu':
                return <SelectMenuComponent key={index} uiControl={uiControl} />;
              case 'checkboxes':
                return <CheckboxComponent key={index} uiControl={uiControl} />;
              case 'radioButtons':
                return <RadioButtonComponent key={index} uiControl={uiControl} />;
              default:
                return null;
            }
          })}
        </div>
      );
    } catch (error) {
      return <div>Error: Unable to parse result.</div>;
    }
  } else {
    return <div>Loading...</div>;
  }
}

function TextInputComponent({ uiControl }) {
  const data = uiControl; // Access uiControl instead of data
  return (
    <div className={styles.component}>
      <label htmlFor={data.textInput.id}>{data.textInput.label}</label>
      <p>{data.parameterDescription}</p>
      <input
        type="text"
        id={data.textInput.id}
        value={data.textInput.value}
        placeholder={data.textInput.placeholder}
      />
    </div>
  );
}

function SelectMenuComponent({ uiControl }) {
  const data = uiControl; // Access uiControl instead of data
  return (
    <div className={styles.component}>
      <label htmlFor={data.selectMenu.id}>{data.selectMenu.label}</label>
      <select id={data.selectMenu.id}>
        {data.selectMenu.options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxComponent({ uiControl }) {
  const data = uiControl; // Access uiControl instead of data
  return (
    <div className={styles.component}>
      <label><strong>{data.parameter}</strong></label>
      <p>{data.parameterDescription}</p>
      {data.checkboxes.map((checkbox, index) => (
        <div key={index}>
          <input 
            type="checkbox" 
            id={checkbox.id} 
            checked={checkbox.checked} 
            onChange={() => {/* handle change */}}
          />
          <label htmlFor={checkbox.id}>{checkbox.label}</label>
        </div>
      ))}
    </div>
  );
}

function RadioButtonComponent({ uiControl }) {
  const data = uiControl;
  return (
    <div className={styles.component}>
      <label>{data.radioButtons.label}</label>
      <p>{data.parameterDescription}</p>
      {data.radioButtons.options && Array.isArray(data.radioButtons.options) ? (
        data.radioButtons.options.map((option, index) => (
          <div key={index}>
            <input type="radio" id={option.id} name="radioGroup" value={option.value} />
            <label htmlFor={option.id}>{option.label}</label>
          </div>
        ))
      ) : (
        <p>No options available</p> // Provide a fallback message or UI if options are not defined.
      )}
    </div>
  );
}

// original that needs to be fixed:
// function RadioButtonComponent({ uiControl }) {
//   const data = uiControl; // Access uiControl instead of data
//   return (
//     <div className={styles.component}>
//       <label>{data.radioButtons.label}</label>
//       <p>{data.parameterDescription}</p>
//       {data.radioButtons.options.map((option, index) => (
//         <div key={index}>
//           <input type="radio" id={option.id} name="radioGroup" value={option.value} />
//           <label htmlFor={option.id}>{option.label}</label>
//         </div>
//       ))}
//     </div>
//   );
// }