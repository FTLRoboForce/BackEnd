const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const config = new Configuration({
  apiKey: process.env.OPEN_AI_KEY
});

const openAi = new OpenAIApi(config);
app.get("/", (req, res) => {
  res.send({ ping: "pong" });
});

app.post("/flashcard", async (req, res) => {
  const { number, difficultyLevel, subject, optionalSection } = req.body;
  let content = `Create ${number} unique ${difficultyLevel} flashcard(s) about ${subject} specifically ${optionalSection}.
  The question(s) are meant for academic uses so don't include too broad question(s).
   Response should be returned as an array of json objects where the response would look like:
  [{"question" : "What is the general formula for alkane?", "answer": "CnH2n+2"}]`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 200,
      temperature: 0.8,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    return res.status(200).json({
      success: true,
      data: response.data.choices[0].message.content,
      console: console.log(response.data.choices[0].message.content)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server"
    });
  }
});

app.post("/quiz", async (req, res) => {
  const { number, difficultyLevel, subject, optionalSection } = req.body;
  let content = `Create ${number} unique ${difficultyLevel} multiple-choice questions about ${subject} specifically ${optionalSection}.
  The answer should be a string (the answer must be 
      in the options and not as an index of the options)
      and the options should be an array of strings. 
      All keys and values must be enclosed in double quotes.
  ### store as an array of json objects where the question,options and answer are keys:
  {
      "question": "What is the capital of France?",
      "options": ["New York", "London", "Paris", "Dublin"],
      "answer": "Paris"
    }
  `
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.6,
      max_tokens: 200,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    return res.status(200).json({
      success: true,
      console: console.log((response.data.choices[0].message.content)),
      data: (response.data.choices[0].message.content),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      error: error.response
        ? error.response.data
        : "There was an issue on the server"
    });
  }
});

const port = process.env.PORT || 3002;

app.listen(port, () => console.log(`Server listening on port ${port}`));
