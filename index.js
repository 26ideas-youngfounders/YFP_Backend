import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import PDFMerger from 'pdf-merger-js';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { parse } from 'node-html-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

import { initEnvFromSSM } from "./ssm-env.mjs";

// 🔽 run the bootstrap FIRST
await initEnvFromSSM({
  prefix: process.env.SSM_PREFIX || "/yfp-backend",
  // optional: restrict to only the names you care about; omit to load all under the prefix
  keys: [
    "OPENAI_API_KEY",
    "LegalAssistantThread","MarketingAssistantThread","MarketresearchAssistantThread",
    "PUPPETEER_CACHE_DIR","ProductAssistantThread","SalesAssistantThread","YFP_NARATIVE_COMPILER",
    "YFP_NARATIVE_Q1","YFP_NARATIVE_Q3","YFP_NARATIVE_Q4","YFP_NARATIVE_Q5","YFP_NARATIVE_Q6",
    "YFP_NARATIVE_Q7","YFP_NARATIVE_Q8","YFP_NARATIVE_Q9","YFP_NARATIVE_Q10","YFP_NARATIVE_Q11",
    "YFP_NARATIVE_Q12","YFP_NARATIVE_Q13","YFP_NARATIVE_Q14","YFP_NARATIVE_Q15","YFP_NARATIVE_Q16",
    "YFP_NARATIVE_Q17","YFP_NARATIVE_Q18","YFP_NARATIVE_Q19","YFP_NARATIVE_Q20","YFP_NARATIVE_Q21",
    "YFP_NARATIVE_Q22","YFP_NARATIVE_Q23","YFP_NARATIVE_Q24","YFP_NARATIVE_Q25",
    "RetailVerticalThread","HealthcareVeritcalThread","FoodVerticalThread",
    "TechnologyVerticalThread","EducationVerticalThread"
  ],
  seedMissingFromEnv: true, // writes any present envs to SSM if missing (no overwrite)
});

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const YFP_NARATIVE_Q1= process.env.YFP_NARATIVE_Q1;
const YFP_NARATIVE_Q3= process.env.YFP_NARATIVE_Q3;
const YFP_NARATIVE_Q4= process.env.YFP_NARATIVE_Q4;
const YFP_NARATIVE_Q5= process.env.YFP_NARATIVE_Q5;
const YFP_NARATIVE_Q6= process.env.YFP_NARATIVE_Q6;
const YFP_NARATIVE_Q7= process.env.YFP_NARATIVE_Q7;
const YFP_NARATIVE_Q8= process.env.YFP_NARATIVE_Q8;
const YFP_NARATIVE_Q9= process.env.YFP_NARATIVE_Q9;
const YFP_NARATIVE_Q10= process.env.YFP_NARATIVE_Q10;
const YFP_NARATIVE_Q11= process.env.YFP_NARATIVE_Q11;
const YFP_NARATIVE_Q12= process.env.YFP_NARATIVE_Q12;
const YFP_NARATIVE_Q13= process.env.YFP_NARATIVE_Q13;
const YFP_NARATIVE_Q14= process.env.YFP_NARATIVE_Q14;
const YFP_NARATIVE_Q15= process.env.YFP_NARATIVE_Q15;
const YFP_NARATIVE_Q16= process.env.YFP_NARATIVE_Q16;
const YFP_NARATIVE_Q17= process.env.YFP_NARATIVE_Q17;
const YFP_NARATIVE_Q18= process.env.YFP_NARATIVE_Q18;
const YFP_NARATIVE_Q19= process.env.YFP_NARATIVE_Q19;
const YFP_NARATIVE_Q20= process.env.YFP_NARATIVE_Q20;
const YFP_NARATIVE_Q21= process.env.YFP_NARATIVE_Q21;
const YFP_NARATIVE_Q22= process.env.YFP_NARATIVE_Q22;
const YFP_NARATIVE_Q23= process.env.YFP_NARATIVE_Q23;
const YFP_NARATIVE_Q24= process.env.YFP_NARATIVE_Q24;
const YFP_NARATIVE_Q25= process.env.YFP_NARATIVE_Q25;
const YFP_NARATIVE_COMPILOR=process.env.YFP_NARATIVE_COMPILOR;
const MarketingAssistantThread=process.env.MarketingAssistantThread;
const MarketresearchAssistantThread=process.env.MarketresearchAssistantThread;
const SalesAssistantThread=process.env.SalesAssistantThread;
const ProductAssistantThread=process.env.ProductAssistantThread;
const LegalAssistantThread=process.env.LegalAssistantThread;
const RetailVerticalThread=process.env.RetailVerticalThread;
const HealthcareVeritcalThread=process.env.HealthcareVeritcalThread;
const FoodVerticalThread=process.env.FoodVerticalThread;
const TechnologyVerticalThread=process.env.TechnologyVerticalThread;
const EducationVerticalThread=process.env.EducationVerticalThread;
const FundingAssistantThread=process.env.FundingAssistantThread;
const HiringAssistantThread=process.env.HiringAssistantThread;


const REQUIRED = ['OPENAI_API_KEY','YFP_NARATIVE_Q1', /* …add the rest… */];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.warn('Missing env after SSM bootstrap:', missing);
}



app.get('/healthz', (req, res) => res.status(200).send('ok'));


app.use(cors());
app.use(express.json());



app.post('/chatq1', async (req, res) => {

  const userMessage = req.body.message;
  const threadid = req.body.user.threadId;

  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if (!threadid) {
    return res.status(400).json({ reply: "threadid is required" });
  }

  try {
    // Send user message
    await openai.beta.threads.messages.create(threadid, {
      role: "user",
      content: `Answer: ${userMessage}`,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(threadid, {
      assistant_id: YFP_NARATIVE_Q1,
    });

    // Poll until run completes
    let runstatus;
    let attempts = 0;
    const maxAttempts = 60;
    do {
      runstatus = await openai.beta.threads.runs.retrieve(threadid, run.id);
      if (runstatus.status === "completed") break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    } while (
      (runstatus.status === "queued" || runstatus.status === "in_progress") &&
      attempts < maxAttempts
    );

    // Get the last assistant message
    const messages = await openai.beta.threads.messages.list(threadid);
    const lastMessage = messages.data.find((msg) => msg.role === "assistant");


    let jsonReply = null;
    let textReply = null;

    if (lastMessage?.content?.[0]?.type === "output_json") {
      jsonReply = lastMessage.content[0].json;
    } else if (lastMessage?.content?.[0]?.type === "text") {
      try {
        jsonReply = JSON.parse(lastMessage.content[0].text.value);
      } catch {
        textReply = lastMessage.content[0].text.value;
      }
    }



    res.json({
      reply: jsonReply || textReply || "No reply, try again",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }
});




app.post('/chatq3', async (req, res) => {
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q3,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/chatq4', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q4,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});



app.post('/chatq5', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q5,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});



app.post('/chatq6', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q6,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});







app.post('/chatq7', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q7,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});




app.post('/chatq8', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q8,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq9', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q9,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq10', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q10,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/chatq11', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q11,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});



app.post('/chatq12', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q12,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/chatq13', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q13,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq14', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q14,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq15', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q15,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq16', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q16,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq17', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q17,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/chatq18', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q18,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq19', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q19,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq20', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q20,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq21', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q21,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq22', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q22,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq23', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q23,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq24', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q24,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/chatq25', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: YFP_NARATIVE_Q25,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});






app.post('/retailsalesmentor', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: SalesAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/retailmarketresearchmentor', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: MarketresearchAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/retailproductmentor', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: ProductAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/retailmarketingmentor', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: MarketingAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/retaillegalmentor', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: LegalAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});




app.post('/retailvertical', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: RetailVerticalThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});



app.post('/healthcarevertical', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: HealthcareVeritcalThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});





app.post('/foodvertical', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: FoodVerticalThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});




app.post('/technologyvertical', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: TechnologyVerticalThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});


app.post('/educationvertical', async (req, res) => {
  console.log("test /chat");
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
console.log(threadid);
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: EducationVerticalThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});





app.post('/chatcompile', async (req, res) => {
  console.log("test /chatcompile");
  let userMessage = req.body.message;
  const threadid = req.body.user.threadId;

  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if (!threadid) {
    return res.status(400).json({ reply: "threadid is required" });
  }

  try {

    // const filePath = await createPdfFromSections(sections);
// res.sendFile(filePath);


    const ExecutiveSummary = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y", "executive_summary");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const NorthStar = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y", "north_star");
    await new Promise(resolve => setTimeout(resolve, 1000));

    const ProblemStatement = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y", "problem_solution");
    await new Promise(resolve => setTimeout(resolve, 1000));

    const SalesModule = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y", "sales_module", );
    await new Promise(resolve => setTimeout(resolve, 1000));

    const PeopleModule = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y","people_module" );
    await new Promise(resolve => setTimeout(resolve, 1000));

    const FinancialViability = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y","financial_viability" );
    await new Promise(resolve => setTimeout(resolve, 1000));

    const Conclusion = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y","conclusions" );
    await new Promise(resolve => setTimeout(resolve, 1000));

    const Bibliography = await getPdfBufferFromAssistant(threadid, "asst_V0ZyALXY42gy41jMNXkdHy5Y", "annexures_bibliography");
await new Promise(resolve => setTimeout(resolve, 1000));


        const sections = [
      { title: "Executive Summary", text: ExecutiveSummary },
      { title: "North Star", text: NorthStar },
      { title: "Problem Statement", text: ProblemStatement },
      { title: "Sales Module", text: SalesModule },
      { title: "People Module", text: PeopleModule },
      { title: "Financial Viability", text: FinancialViability },
      { title: "Conclusion", text: Conclusion },
      { title: "Bibliography", text: Bibliography },
    ];

    let filePath = await createPdfFromSections(sections);

//     if (!sections.every(s => s.text.startsWith('<h1>'))) {
//   throw new Error('One or more sections did not return valid HTML');
// }

        let pdfBuffer = await createPdfFromSections(sections);

  //  console.log("PDF Buffer Start:", pdfBuffer.slice(0, 8).toString('utf8'));


    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", "inline; filename=merged.pdf");
    // res.send(pdfBuffer);

//     res.setHeader("Content-Type", "application/pdf");
// res.setHeader("Content-Disposition", "inline; filename=proposal.pdf");
// res.send(pdfBuffer);


// res.setHeader("Content-Type", "application/pdf");
// res.setHeader("Content-Disposition", "inline; filename=proposal.pdf");
res.sendFile(filePath);



  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }
}); 


app.post('/fundingassistant', async (req, res) => {
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: FundingAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});

app.post('/hiringassistant', async (req, res) => {
  const userMessage = req.body.message;
  const threadid= req.body.user.threadId;
  // const questionid= 1;
  
// console.log(questionid);
  if (!userMessage) {
    return res.status(400).json({ reply: "Message is required." });
  }

  if(!threadid){
    return res.status(400).json({ reply: "threadid is required" });
  //make a method to update thread id if no threadid is found?
  }

  // if(!questionid){
  //   return res.status(400).json({ reply: "questionid is required" });
  // }

  try {

await openai.beta.threads.messages.create(threadid, {
  role: "user",
  content: `Answer: ${userMessage}`,


});

const run = await openai.beta.threads.runs.create(threadid,{
  assistant_id: HiringAssistantThread,
});

let runstatus; // run status for response 
let attempts = 0;
const maxAttempts = 60;// max attempts or timeout seconds
do{
  runstatus= await openai.beta.threads.runs.retrieve(threadid,run.id);
   console.log(runstatus);
  if(runstatus.status === "completed") break;
  await new Promise((resolve) => setTimeout(resolve,1000));
  attempts++;
} while ((runstatus.status === "queued" ||
   runstatus.status === "in_progress") && 
   attempts < maxAttempts);


//fetching response

const messages = await openai.beta.threads.messages.list(threadid);
const lastMessage = messages.data.find((msg)=> msg.role === "assistant");

res.json({
  reply: lastMessage?.content[0]?.text?.value || "No reply try again",
 
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Failed to get response from OpenAI." });
  }







  



});




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});


async function getPdfBufferFromAssistant(threadId, assistantId, mode) {




  console.log("thread id ", threadId);
  console.log("assistant id", assistantId)


  await openai.beta.threads.messages.create(threadId, {
  role: "user",
  // content: ("with the data in the past convesation create a detailed text as described in your system instructions around 850-1000 words. only output the text nothing else. the mode for this request is " ,mode),
  content: `With the data in the previous conversation, create a detailed HTML-formatted section of around 1000 words as described in your system instructions. The mode for this request is: ${mode}`,

});

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
    // instructions: northStarPrompt,
  });

  // Step 2: Wait until the run completes
  let status, attempts = 0;
  const maxAttempts = 60;
  do {
    status = await openai.beta.threads.runs.retrieve(threadId, run.id);
    if (status.status === "completed") break;
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  } while ((status.status === "queued" || status.status === "in_progress") && attempts < maxAttempts);


  const messages = await openai.beta.threads.messages.list(threadId);
// console.log(messages);
  const assistantMessage = messages.data.find(
    msg => msg.run_id === run.id && msg.role === "assistant"
  );

  // if (!assistantMessage || !assistantMessage.attachments?.[0]?.file_id) {
  //   throw new Error(`❌ No PDF found for assistant ${assistantId}`);
  // }

  // Step 5: Download the PDF file and convert to buffer
  // const fileId = assistantMessage.attachments[0].file_id;
  // console.log(fileId," id sent back");
  // const response = await openai.files.content(fileId);
  // return Buffer.from(await response.arrayBuffer());

  // return text


  if(!assistantMessage || !assistantMessage.content?.[0]?.text?.value){
throw new Error(`No text response for mode "${mode}" in assistant ${assistantId} | thread: ${threadId}`);
  }


  console.log(assistantMessage.content[0].text.value)
  return assistantMessage.content[0].text.value;
}




export async function createPdfFromSections(sections) {
  // const pdfDoc = await PDFDocument.create();
  // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // const fontSize = 12;
  // const margin = 50;
  // const lineHeight = fontSize + 4;

  // for (const section of sections) {
  //   let page = pdfDoc.addPage();
  //   let { width, height } = page.getSize();
  //   let y = height - margin;

  //   // const lines = wrapTextByWidth(`${section.title}\n\n${section.text}`, 90);
  //   let lines = wrapTextByWidth(`${section.title}\n\n${section.text}`, font, fontSize, width - 2 * margin);


  //   for (const line of lines) {
  //     if (y < margin) {
  //       page = pdfDoc.addPage();
  //       y = height - margin;
  //     }

  //     page.drawText(line, {
  //       x: margin,
  //       y,
  //       size: fontSize,
  //       font,
  //       color: rgb(0, 0, 0),
  //     });

  //     y -= lineHeight;
  //   }

  //   // Always start the next section on a clean page
  //   pdfDoc.addPage();
  // }

  // // Remove last empty page
  // pdfDoc.removePage(pdfDoc.getPageCount() - 1);

  // const pdfBytes = await pdfDoc.save();
  // return Buffer.from(pdfBytes);





  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const fullHTML = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
          h1 { font-size: 24px; margin-top: 40px; }
          h2 { font-size: 18px; margin-top: 20px; }
          p { margin-bottom: 12px; }
          ul { margin-bottom: 12px; padding-left: 20px; }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          thead {
            background-color: #f5f5f5;
          }
          .section {
            page-break-after: always;
          }
        </style>
      </head>
      <body>
        ${sections.map(s => `<div class="section">${s.text}</div>`).join('\n')}
      </body>
    </html>
  `;



fs.writeFileSync('debug_output.html', fullHTML);

// let root = parse(fullHTML);

// if (!root) {
//   fs.writeFileSync('broken_debug.html', fullHTML);
//   throw new Error("HTML parsing failed – check broken_debug.html");
// }

  // await page.setContent(fullHTML, { waitUntil: 'networkidle0' });
  await page.setContent(fullHTML, { waitUntil: 'domcontentloaded' });


  let pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: {
      top: '30px',
      bottom: '30px',
      left: '40px',
      right: '40px'
    }
  });

  console.log("PDF Buffer Start:", pdfBuffer.slice(0, 8).toString('utf8'));


  await browser.close();

  const filePath = path.resolve(__dirname, 'debug_output.pdf');
fs.writeFileSync(filePath, pdfBuffer);
console.log("Saved PDF to:", filePath);

  return filePath;


  // fs.writeFileSync('debug_output.pdf', pdfBuffer);

  // if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
  //   throw new Error('Failed to generate a valid PDF buffer');
  // }

  // return pdfBuffer;
}



