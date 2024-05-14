const app = require('express')();
const OpenAI = require("openai");   
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "Ola" }],
        model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0].message.content);
    }

main();

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
