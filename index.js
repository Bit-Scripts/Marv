const { token, OPENAI_API_KEY, DEEPL_API_KEY, organization } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const discordTTS = require('discord-tts');
const {AudioPlayer, createAudioResource, StreamType, entersState, VoiceConnectionStatus, joinVoiceChannel} = require("@discordjs/voice");
//const axios = require('axios');

const { Client, Collection, Events, GatewayIntentBits, ActivityType, intents } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

client.on("ready", () =>{
	client.user.setPresence({
		activities: [{ name: `/help`, type: ActivityType.Watching }]
	});
});

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(`Error executing ${interaction.commandName}`);
		console.error(error);
	}
});

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
	organization: organization,
    apiKey:  OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

let msg_bool = true

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

const deepl = require('deepl-node');
const translator = new deepl.Translator(DEEPL_API_KEY);
(async () => {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text); // Bonjour, le monde !
})();

client.on("messageCreate", async (message) => {
	if (msg_bool) {
		console.log('a new message was send');
		msg_bool = !msg_bool;
	}
	if (message.author.bot) return;
	let message_filtre = message.content.split('<@')
	let messageFinal = '@' + message.author.username + ' : ' + message_filtre[0];
	for(let messageUsers of message_filtre ) {
		if (messageUsers != message_filtre[0]) {
			let idPeople = messageUsers.split('>')[0]
			let thanos = await client.users.fetch(idPeople);
			messageUsers = '@' + thanos.username + messageUsers.split('>')[1];
			messageFinal += messageUsers;	
		}
	}
	console.log(messageFinal);
	if (typeof messageFinal === 'string' ? messageFinal.includes('@Marv') : false) {
		let message_Marv = messageFinal.replace('@Marv ', '').replace(' @Marv', '').replace('@Marv', '');
		if (message_Marv === '') return;

		let message_MarvIntermed = message_Marv;
		if (message_Marv.includes('fr_FR')) {
			message_Marv = await translator.translateText(`${message_Marv.replace('fr_FR ', '').replace(' fr_FR', '').replace('fr_FR', '')}`, null, 'en-US');
			message_Marv = message_Marv.text;
		}
		prompt += `You: ${message_Marv}\n`;
		const gptResponse = await openai.createCompletion({
			model: "text-davinci-003",
			prompt: prompt,
			max_tokens: 128,
			temperature: 0.5,
			top_p: 0.5,
			presence_penalty: 0,
			frequency_penalty: 0.5,
		});
		let laReponse = gptResponse.data.choices[0].text;
		message_Marv = message_MarvIntermed;
		if (message_Marv.includes('fr_FR')) {
			laReponse = await translator.translateText(`${laReponse}`, null, 'fr');
			laReponse = laReponse.text
		}
		console.log('@' + laReponse);
		message.channel.send(laReponse.substring(6));
	}
});

// Log in to Discord with your client's token
client.login(token);