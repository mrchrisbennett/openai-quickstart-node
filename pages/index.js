import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

// Create a Loading component
function Loading() {
  return <div className={styles.loading}>
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" stroke="#10a37f">
    <g fill="none" fill-rule="evenodd">
        <g transform="translate(1 1)" stroke-width="2">
            <circle stroke-opacity=".5" cx="18" cy="18" r="18"/>
            <path d="M36 18c0-9.94-8.06-18-18-18">
                <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/>
            </path>
        </g>
    </g>
</svg>
</div>;
}

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
  const [loading, setLoading] = useState(false); // Add loading state

  async function onSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true); // Show loading animation

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
    } finally {
      setLoading(false); // Hide loading animation after API response
    }
  }

  return (
    <div>
      <Head>
        <title>Review clause POC</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <h3>Review a clause</h3>
        <p>Paste in a legal clause (or a few!) and click the button. Wait a few seconds and the AI should give you a few UI controls that it thinks you need based on the clause text.</p>
        <p>Questions? Ideas? Need help? Reach out at chris.bennett@thomsonreuters.com and I'll see what I can do.</p>
        <form className={styles.form} onSubmit={onSubmit}>
          <input
            type="text"
            name="clause"
            placeholder="Enter clause(s) to review"
            value={clauseInput}
            onChange={(e) => setClauseInput(e.target.value)}
          />
          <input className={styles.submit} type="submit" value="Let's go" />
        </form>

        {/* Render loading component when loading is true */}
        {loading && <Loading />}

        {/* Render the SubmittedText component with the submitted text */}
        {submittedText && <SubmittedText text={submittedText} />}

        {/* Conditionally render the "API Response" details */}
        {result && ( // Check if result is truthy (not null or undefined)
          <details>
            <summary>API Response:</summary>
            <div className={styles.result}>{result}</div>
          </details>
        )}

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
  } 
}

function TextInputComponent({ uiControl }) {
  const data = uiControl; // Access uiControl instead of data
  const [inputValue, setInputValue] = useState(data.textInput.value || '');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={styles.component}>
      <label htmlFor={data.textInput.id}>{data.textInput.label}</label>
      <p>{data.parameterDescription}</p>
      <input
        type="text"
        id={data.textInput.id}
        value={inputValue}
        onChange={handleInputChange} // Update the input value on change
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
  const [checkedItems, setCheckedItems] = useState(
    data.checkboxes.reduce((acc, checkbox) => {
      acc[checkbox.id] = checkbox.checked || false;
      return acc;
    }, {})
  );

  const handleCheckboxChange = (e) => {
    const checkboxId = e.target.id;
    const isChecked = e.target.checked;

    setCheckedItems((prevCheckedItems) => ({
      ...prevCheckedItems,
      [checkboxId]: isChecked,
    }));
  };

  return (
    <div className={styles.component}>
      <label>
        <strong>{data.parameter}</strong>
      </label>
      <p>{data.parameterDescription}</p>
      {data.checkboxes.map((checkbox, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={checkbox.id}
            checked={checkedItems[checkbox.id]}
            onChange={handleCheckboxChange}
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