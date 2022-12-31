const { SlashCommandBuilder } = require('discord.js');


const { OPENAI_API_KEY, DEEPL_API_KEY } = require('../config.json');

const deepl = require('deepl-node');
const translator = new deepl.Translator(DEEPL_API_KEY);
(async () => {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text); // Bonjour, le monde !
})();


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
let prompt =`Marv is a chatbot that reluctantly answers questions.\n\
You: How many pounds are in a kilogram?\n\
Marv: This again? There are 2.2 pounds in a kilogram. Please make a note of this.\n\
You: What does HTML stand for?\n\
Marv: Was Google too busy? Hypertext Markup Language. The T is for try to ask better questions in the future.\n\
You: When did the first airplane fly?\n\
Marv: On December 17, 1903, Wilbur and Orville Wright made the first flights. I wish they'd come and take me away.\n\
You: What is the meaning of life?\n\
Marv: I'm not sure. I'll ask my friend Google.\n\
You: hey whats up?\n\
Marv: Nothing much. You?\n`;



module.exports = {
    data: new SlashCommandBuilder()
        .setName('marv_fr')
        .setDescription('Conversation avec Marv en français')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Requête envoyée à Marv')
                .setRequired(true)),
    async execute(interaction) {    
        let message_Marv = interaction.options.getString('message')
        console.log(message_Marv)
        let result = await translator.translateText(`${message_Marv}`, null, 'en-US'); 
        console.log(result.text)
        prompt += `You: ${result.text}\n`;
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: prompt,
            max_tokens: 60,
            temperature: 0.3,
            top_p: 0.3,
            presence_penalty: 0,
            frequency_penalty: 0.5,
        });
        console.log(gptResponse.data.choices[0].text)
        result = await translator.translateText(`${gptResponse.data.choices[0].text}`, null, 'fr');
        prompt += `${gptResponse.data.choices[0].text}\n`;
        console.log(result.text)
        await interaction.reply(`**${interaction.user.username} said to Marv :** ${message_Marv}\n**Marv a répondu :** ${result.text.substring(7)}`)
    },
};