import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const clause = req.body.clause || '';
  if (clause.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid clause",
      }
    });
    return;
  }

  try {
    const completion = await openai.createCompletion({
    model: "gpt-3.5-turbo-instruct",
    prompt: generatePrompt(req.body.clause),
    temperature: 0.4,
    max_tokens: 2048,
});
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(clause) {
  const capitalizedClause =
    clause[0].toUpperCase() + clause.slice(1).toLowerCase();
  return `I am drafting a legal document, and here is a legal clause that I am working on: ${capitalizedClause}
  
  Review the clause and give me recommended parameters (10 at most) that I might want to adjust. Choose the appropriate UI controls to adjust each parameter. Your options are checkboxes, select menu, or a text input.

  Give me the results as JSON. Do not include any explanations, only provide a RFC8259 compliant JSON response.
   
  UI control JSON examples. These are only examples, so please fill in with relevant information.
 
  
    Radio buttons:
    {
      "radioButtons": [
        {
          "id": "radio1",
          "label": "Radio 1",
          "checked": false
        },
        {
          "id": "radio2",
          "label": "Radio 2",
          "checked": false
        }
      ]
    }
    
    Select menu:
    {
      "selectMenu": {
        "id": "selectMenu1",
        "label": "Select Menu",
        "options": [
          {
            "value": "option1",
            "label": "Option 1"
          },
          {
            "value": "option2",
            "label": "Option 2"
          }
        ],
        "selected": "option1"
      }
    }
    
    Text:
    {
      "textInput": {
        "id": "textInput1",
        "label": "Text Input",
        "value": "",
        "placeholder": "Enter text here"
      }
    }
  
  JSON structure:
      "parameter": "type of parameter recommended: either textInput, selectMenu, radios, or checkboxes",
      "parameterDescription": "a brief description of what this clause parameter is, and some guidance for how I could configure it",
      "uiControl": "which ui control it should use",
      JSON for the UI control from above examples.

      If there is more than one parameter, create an array of the parameters.
      
      Output the JSON:`
  ;
}
