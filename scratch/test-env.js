require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash', 
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } 
    });

    const result = await model.generateContent("hello");
    console.log("SUCCESS:", result.response.text());
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
test();
