const express = require("express");
const { Configuration, OpenAIApi } = require("openai");

const router = express.Router();
require("dotenv").config();

const config = new Configuration({
  apiKey: process.env.OPEN_AI_KEY
});

const openAi = new OpenAIApi(config);

router.post("/flashcards", async function (req, res, next) {
  const { number, difficultyLevel, subject, optionalSection } = req.body;
  let content = `Create ${number} unique ${difficultyLevel} flashcard(s) about ${subject} specifically ${optionalSection}.
  Depending on the difficulty level, the questions should be more difficult. Medium should be more difficult than easy.
   Hard questions should be more difficult than medium questions. 
  Medium questions should be meant for graduate students and hard questions should be meant for experts.
  `;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Response should be returned as an array of json objects where the response would look like:
          [{"question" : "What is the general formula for alkane?", "answer": "CnH2n+2"}]`
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 1000,
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

router.post("/quiz", async function (req, res, next) {
  const { number, difficultyLevel, subject, optionalSection } = req.body;
  let content = `Create ${number} unique ${difficultyLevel} multiple-choice questions about ${subject} specifically ${optionalSection}.
  Depending on the difficulty level, the questions should be more difficult. Hard questions should be more difficult than medium questions. 
  Medium questions should be meant for graduate students and hard questions should be meant for experienced professionals in their respective fields .
   Easy questions should be meant for high school students.`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Response should be returned as an array of json objects where the response would look like:
          The answer should be a string (the answer must be in the options and not as an index of the options) and the options should be an array of strings. 
          All keys and values must be enclosed in double quotes.
          ### store as an array of json objects where the question,options and answer are keys:
          {"question": "What is the capital of France?","options": ["New York", "London", "Paris", "Dublin"],"answer": "Paris"}`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    return res.status(200).json({
      success: true,
      console: console.log(response.data.choices[0].message.content),
      data: response.data.choices[0].message.content
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

router.post("/challenge", async function (req, res, next) {
  const { question, answer } = req.body;
  let content = `I believe the answer to ${question} is ${answer}. Please respond true if I am correct and false if I am incorrect.`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Response should be returned as true or false.`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.6,
      max_tokens: 1000,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    return res.status(200).json({
      success: true,
      console: console.log(response.data.choices[0].message.content),
      data: response.data.choices[0].message.content
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

module.exports = router;
