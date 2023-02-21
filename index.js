const { token, OPENAI_API_KEY, DEEPL_API_KEY, organization, WITAIKEY } = require('./config.json');
const fsPromises = require("fs/promises");
const fs = require("fs");
const path = require('node:path');
const googleTTS = require('google-tts-api');
const { Client, Collection, GatewayIntentBits, ActivityType, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates] });
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const { createAudioPlayer,  createAudioResource, AudioPlayerStatus, joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const { Configuration, OpenAIApi } = require("openai");
const deepl = require('deepl-node');
const { forEachChild } = require('typescript');
const translator = new deepl.Translator(DEEPL_API_KEY);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    if (newVoiceState.channel) { // The member connected to a channel.
        console.log(`${newVoiceState.member.user.tag} connected to ${newVoiceState.channel.name}.`);
	} else if (oldVoiceState.channel) { // The member disconnected from a channel.
        console.log(`${oldVoiceState.member.user.tag} disconnected from ${oldVoiceState.channel.name}.`)
    };
});

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

const configuration = new Configuration({
	organization: organization,
    apiKey:  OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

let msg_bool = true

let prompt =`Tu es Marv qui est un chatbot à la fois un expert en informatique et un compagnon de conversation.\n
Le bot doit être capable de parler de tout et de rien, tout en ayant une connaissance approfondie des sujets liés à l'informatique.\n
Il doit être capable de répondre à des questions techniques sur les langages de programmation,\n
les architectures de systèmes, les protocoles réseau, etc. en utilisant un langage simple et accessible.\n
Le bot doit également être capable de maintenir une conversation intéressante et engageante,\n
en utilisant des techniques de génération de texte avancées telles que l'humour, l'empathie et la personnalisation.\n
Utilisez les dernières avancées de l'IA pour créer un bot qui peut apprendre de ses interactions avec les utilisateurs et s'adapter à leur style de conversation.\n
Il respect le MarkDown pour partager du code.\n`;

(async () => {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text); // Bonjour, le monde !
})();


client.on("messageCreate", async (message) => {
	adminChannel = client.channels.cache.get('1064208603076108440');
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
	adminChannel.send('-------------------------')
	adminChannel.send(messageFinal);
	if (typeof messageFinal === 'string' ? messageFinal.includes('@Marv') : false) {
		let message_Marv = messageFinal.replace('@Marv ', '').replace(' @Marv', '').replace('@Marv', '').replace('You', '');
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
			max_tokens: 600,
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
		let messagesArray = [];
		if (laReponse.length >= 2000) {
			cutReponse = laReponse.replace('Marv :', '').replace('Marv:', '').split(".").split(",").split("\n");
			messagesArray.push(cutReponse);
		}
		if (messagesArray.length) {
			messagesArray.forEach( message => { message.channel.send(message) } )
		} else {
			message.channel.send(laReponse.replace('Marv :', '').replace('Marv:', ''))
		}
		adminChannel.send('-------------------------')
		adminChannel.send('@' + laReponse);
	}
});

const player = createAudioPlayer();
player.stop();

function PlayMP3() {
	let resource = createAudioResource(path.join(__dirname, 'Marv.mp3'));
	player.play(resource);
}

player.on(AudioPlayerStatus.Playing, () => {
	console.log('The audio player has started playing!');
});

client.on('ready', () => {
	const connection = joinVoiceChannel({
		channelId: '1039788045441978371',
		guildId: '1039788044691181608',
		adapterCreator: client.guilds.cache.get('1039788044691181608').voiceAdapterCreator,
	});
	connection.on(VoiceConnectionStatus.Ready, () => {
		console.log('The connection has entered the Ready state - ready to play audio!');
		connection.subscribe(player);
	});
})

// Log in to Discord with your client's token
client.login(token);