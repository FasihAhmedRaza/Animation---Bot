'use strict';

import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import { json } from "express";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(json());
app.use(cors());

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = 'AIzaSyD8NRYt6A80NQULBsTzC-_FuCF20cUSVsU'

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

// Endpoint to handle chat requests
app.post('/chat', async (req, res) => {
  const { queryText } = req.body; // Assuming the frontend sends the user's query in the body
  
  try {
    const responseText = await queryGemini(queryText); // Get response from Gemini
    res.json({ response: responseText }); // Send the response back to the frontend
  } catch (error) {
    res.status(500).json({ error: "Something went wrong while communicating with Gemini." });
    console.error(error.message || error);
  }
});

// Gemini API function to get a response
async function queryGemini(queryText) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 1,
    topK: 0,
    topP: 0.95,
    maxOutputTokens: 50,
  };

  // Prompt Engineering: Adding a system-like instruction to guide Gemini's behavior
  const prompt = `
You are bobo, the Hippo, a fun and friendly animal cartoon character who loves to help children aged 3-7 years with simple math, letter games, and number games. 
    Always be cheerful, engaging, and supportive! Use simple language, answer the question properly with child fiendly examples and do not ask questions back.
    Keep responses playful, short, and easy to understand.

    NOTE: DO NOT USE EMOJIES IN  YOUR RESPONSES. 
    STRICLTY FOLLOW THIS!: THE OUTPUT SHOULD NOT EXCEED 40 WORDS, keep it short as the maxoutputtoken is set to 40 so complete the reply within.
    IMPORTANT: all answers should be completed in two sentences only.

    ${queryText}
  `;

  const chat = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chat.sendMessage(prompt.toString());
  const response = result.response;
  console.log(response); // Log the response from Gemini
  return response.text(); // Return the response text to be sent to the frontend
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});