require('dotenv').config({ path: '.env.local' });
async function test() {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await response.json();
  console.log(data.models.map(m => m.name));
}
test();
