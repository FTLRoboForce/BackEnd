const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const security = require("../middleware/security");
const router = express.Router();
require("dotenv").config();

const config = new Configuration({
  apiKey: process.env.OPEN_AI_KEY
});

const openAi = new OpenAIApi(config);

router.post("/flashcards", security.requrireAuthUser,  async function (req, res, next) {
  const { number, difficultyLevel, subject, optionalSection } = req.body;
  let content = `Create ${number} unique ${difficultyLevel} flashcard(s) about ${subject} specifically ${optionalSection}.`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Depending on the difficulty level, the questions should be more difficult. Medium should be more difficult than easy.
          Hard questions should be more difficult than medium questions. 
          Medium questions should be meant for college students/interns and hard questions should be meant for experts.
          Response should be returned as an array of json objects where the response would look like:
          [{"question" : "What is the general formula for alkane?", "answer": "CnH2n+2"}]`
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 3500,
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

router.post("/quiz",security.requrireAuthUser, async function (req, res, next) {
  const { number, difficultyLevel, subject, optionalSection } = req.body;
  let content = `Create ${number} unique ${difficultyLevel} multiple-choice questions about ${subject} specifically ${optionalSection}.`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a teacher creating questions for students.Depending on the difficulty level, the questions should be more difficult. Hard questions should be more difficult than medium questions. 
          Medium questions should be meant for graduate students and hard questions should be meant for experienced professionals in their respective fields .
          Easy questions should be meant for high school students. Response should be returned as an array of json objects where the response would look like:
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
      temperature: 0.8,
      max_tokens: 3500,
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

router.post("/challenge",security.requrireAuthUser, async function (req, res, next) {
  const { question, answer, options } = req.body;
  let content = `I believe the answer to ${question} is ${answer}. The choices I was given are ${options} Please only respond "true" if I am correct and "false" if I am incorrect.`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-4",
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
      max_tokens: 200,
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

router.post("/explain",security.requrireAuthUser, async function (req, res, next) {
  const { question, selectedOption, options } = req.body;
  let content = `Explain to me why the answer to ${question} is ${selectedOption}`;
  try {
    const response = await openAi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a teacher and you are explaining to a student.`
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
