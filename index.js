const { token, OPENAI_API_KEY, DEEPL_API_KEY, GCkey } = require('./config.json');
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, ActivityType, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates] });
const path = require('path');
const { exists } =require('fs');
const eventsPath = path.join(__dirname, '/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const { createAudioResource, createAudioPlayer,  joinVoiceChannel, VoiceConnectionStatus, VoiceConnection } = require('@discordjs/voice');
const { Configuration, OpenAIApi } = require("openai");
const deepl = require('deepl-node');
const translator = new deepl.Translator(DEEPL_API_KEY);
const commandsPath = path.join(__dirname, '/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const util = require('util');
const textToSpeech = require('@google-cloud/text-to-speech');
const { addSpeechEvent, resolveSpeechWithGoogleSpeechV2 } = require("discord-speech-recognition");
const tts = new textToSpeech.TextToSpeechClient();
let botisConnected = false
let speak = false
addSpeechEvent(client, { 
	key: GCkey,
	lang: 'fr-FR', 
	profanityFilter:false,
	speechRecognition: resolveSpeechWithGoogleSpeechV2, 
	ignoreBots: true,
});

//addSpeechEvent(client, { key: 'WITAIKEY' });

Marv_channel = client.channels.cache.find(channel => channel.id === '1077629023577976902')

client.once("ready", () => {
	console.log(`${client.user.tag} loading to Voice!`);
	let channel = client.channels.cache.find(channel => channel.id === '1079588443929190420')
	channel.send('<@1058811530092748871>')
})

/*client.once('speech', (msg) => {
	if (msg.content) console.log(`${client.user.tag} is Ready to Talk!`);
})*/

client.on("voiceStateUpdate", (oldVoiceState, newVoiceState) => { // Listeing to the voiceStateUpdate event
    if (newVoiceState.channel) { // The member connected to a channel.
		speak = false
		addSpeechEvent.shouldProcessSpeech = !speak
		return speak
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

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const interactionMessage = await interaction.fetchReply();
	//console.log(interactionMessage.content);
	if (interactionMessage.content !== "Mais, vous savez, moi je ne crois pas qu'il y ait de bonne ou de mauvaise situation. Moi, si je devais résumer ma vie aujourd'hui avec vous, je dirais que c'est d'abord des rencontres, des gens qui m'ont tendu la main, peut-être à un moment où je ne pouvais pas, où j'étais seul chez moi. Et c'est assez curieux de se dire que les hasards, les rencontres forgent une destinée... Parce que quand on a le goût de la chose quand on a le goût de la chose bien faite, le beau geste, parfois on ne trouve pas l'interlocuteur en face, je dirais, le miroir qui vous aide à avancer. Alors ce n'est pas mon cas, comme je le disais là, puisque moi au contraire, j'ai pu ; et je dis merci à la vie, je lui dis merci, je chante la vie, je danse la vie... Je ne suis qu'amour ! Et finalement, quand beaucoup de gens aujourd'hui me disent « Mais comment fais-tu pour avoir cette humanité ? », eh ben je leur réponds très simplement, je leur dis que c'est ce goût de l'amour, ce goût donc qui m'a poussé aujourd'hui à entreprendre une construction mécanique, mais demain, qui sait, peut-être seulement à me mettre au service de la communauté, à faire le don, le don de soi...") {
		speak = true
		synthesizeSpeech(interactionMessage.content.replace('/',' slash ').replace('/',' slash ').replace('Low-Fuel','LowFuel').replace('-',' tiret ').replace('-',' tiret '), Marv_channel, speak)
	} else {
		PlayMP3('./monologue.mp3', speak)
	}
});

const configuration = new Configuration({
	apiKey:  OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

let prompt =`Salut, je suis Marv, un chatbot conversationnel et expert en informatique !
Je suis là pour t'aider avec tous les aspects de l'informatique, et je suis toujours prêt à répondre à tes questions.
Je suis un chatbot sympathique et ouvert d'esprit, donc n'hésite pas à me parler de tout et n'importe quoi.
Que tu aies des questions sur la programmation, les ordinateurs, les logiciels, les réseaux, ou même si tu cherches simplement des conseils sur l'informatique en général, je suis là pour toi.
Ensemble, nous pouvons explorer le monde de l'informatique et résoudre les problèmes que tu rencontres.
Alors, pose-moi une question et voyons ce que nous pouvons découvrir ensemble !`;

(async () => {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text); // Bonjour, le monde !
})();

const player = createAudioPlayer();



function PlayMP3(resource, speak) {
	resource = createAudioResource(resource);
	console.log('lancement de la lecture')
	player.play(resource)
}

player.addListener("stateChange", (oldOne, newOne) => {
	if (newOne.status === "idle") {
		exists('/tmp/', function (doesExist) {  
			if (doesExist) {  
				console.log('le fichier existe');  
				fs.unlink("output.mp3", (err) => {
					if (err) throw err;
					console.log("File deleted!");
				});
			} else {  
				console.log('le fichier n\'existe pas');  
			}  
		});
		speak = false
		addSpeechEvent.shouldProcessSpeech = !speak
		return speak
	}
});

async function synthesizeSpeech(text, Marv_channel, speak) {
	if (!speak) return

	text = text.replace('\n', '. ')
	// Construct the request
	const request = {
		input: {text: text},
		// Select the language and SSML voice gender (optional)
		voice: {languageCode: 'fr-FR', name: 'fr-FR-Neural2-B',ssmlGender: 'MALE'},
		// select the type of audio encoding
		audioConfig: {audioEncoding: 'MP3'},
	};

	// Performs the text-to-speech request
	const [response] = await tts.synthesizeSpeech(request);
	// Write the binary audio content to a local file
	const writeFile = util.promisify(fs.writeFile);
	await writeFile('output.mp3', response.audioContent, 'binary')
	.then(_ => { 
		console.log('Audio content written to file: output.mp3'); 
		if (Marv_channel !== '1079588443929190420') PlayMP3('output.mp3', speak);		
	});
}

async function Marv(msg, speak) {
	console.log('Marv is speak : ' + speak)
	if (!speak) return
	let msg_filtre = msg.content?.split('<@')
	let msgFinal = '@' + msg.author?.username + ' : ' + msg_filtre[0];
	for(let msgUsers of msg_filtre ) {
		if (msgUsers != msg_filtre[0]) {
			let idPeople = msgUsers.split('>')[0]
			let thanos = await client.users.fetch(idPeople);
			msgUsers = '@' + thanos.username + msgUsers.split('>')[1];
			msgFinal += msgUsers;	
		}
	}
	console.log(msgFinal);
	adminChannel.send('-------------------------')
	adminChannel.send(msgFinal);
	if (typeof msgFinal === 'string' ? msgFinal.includes('@Marv') : false) {
		let msg_Marv = msgFinal.replace('@Marv ', '').replace(' @Marv', '').replace('@Marv', '').replace('You', '');
		if (msg_Marv === '') return;

		let msg_MarvIntermed = msg_Marv;
		if (msg_Marv.includes('fr_FR')) {
			msg_Marv = await translator.translateText(`${msg_Marv.replace('fr_FR ', '').replace(' fr_FR', '').replace('fr_FR', '')}`, null, 'en-US');
			msg_Marv = msg_Marv.text;
		}
		prompt += `You: ${msg_Marv}\n`;

		let laReponse = ''

		const gptResponse = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{role: "user", content: prompt}]
		});

		laReponse = gptResponse.data.choices[0].message.content;
		msg_Marv = msg_MarvIntermed;
		if (msg_Marv.includes('fr_FR')) {
			laReponse = await translator.translateText(`${laReponse}`, null, 'fr');
			laReponse = laReponse.text
		}

		console.log('@' + laReponse);
		
		await msg.channel.send(laReponse.replace('Marv :', '').replace('Marv:', ''))

		if (laReponse.length >= 2000) {
			await synthesizeSpeech('Votre message étant particulièrement long, je vous invite a allez voir dans le salon dédié', Marv_channel, speak);
		} else {
			await synthesizeSpeech(laReponse.replace('Marv :', '').replace('Marv:', '').replace('Marc', 'Marv'), Marv_channel, speak);
		}
		adminChannel.send('-------------------------');
		adminChannel.send('@' + laReponse);
	}
}
message = ''
client.on("speech", (msg) => {
	// If bot didn't recognize speech, content will be empty
	if (!msg.content) return;
	message = msg.content
	marvChannel = client.channels.cache.get('1079588443929190420');
	marvChannel.send('<@1058811530092748871> ' + msg.author.username + ' ' + message.replace('Marc', 'Marv'))
	console.log(msg.author.username + ' ' + message?.replace('Marc', 'Marv'))
	//Marv(msg)
	console.log(`${client.user.username} loading to Voice!`);
	message = ''
	return message
});

client.on('voiceStateUpdate', (oldState, newState) => {
    botisConnected = oldState.member.user.bot
})

client.on("messageCreate", async (msg) => {
	adminChannel = client.channels.cache.get('1064208603076108440');
	const voiceChannel = client.channels.cache.get('1039788045441978371');
	if (!botisConnected && voiceChannel) {
		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: voiceChannel.guild.id,
			adapterCreator: voiceChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
	  	});
		connection.subscribe(player);
	  	console.log("Listener Is Joining Voice And Listening...");
		botisConnected = true
	}

	speak = true
	addSpeechEvent.shouldProcessSpeech = !speak ;
	if (msg.content !== undefined && msg.content.includes('<@1058811530092748871>') && msg.content !== '<@1058811530092748871>' ) Marv(msg, speak)
});

client.login(token);
