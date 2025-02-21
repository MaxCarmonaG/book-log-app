import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGenAIKey } from "./firebase";

//Call in the event listener for page load
export const askChatBot = async (request) => {
  const apiKey = await getGenAIKey();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  return await model.generateContent(request);
};
