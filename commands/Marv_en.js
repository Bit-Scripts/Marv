const { SlashCommandBuilder } = require('discord.js');


const { OPENAI_API_KEY } = require('../config.json');
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey:  OPENAI_API_KEY,
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
        .setName('marv_en')
        .setDescription('Conversation with Marv in English')	
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Request send to Marv')
                .setRequired(true)),
    async execute(interaction) {
        let message_Marv = interaction.options.getString('message')
        console.log(message_Marv)
        prompt += `You: ${message_Marv}\n`;
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
        prompt += `${gptResponse.data.choices[0].text}\n`;
        await interaction.reply(`**${interaction.user.username} said to Marv :** ${message_Marv}\n**Marv replied :** ${gptResponse.data.choices[0].text.substring(7)}`)
    },
};