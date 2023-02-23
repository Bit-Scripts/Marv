const { token, OPENAI_API_KEY, DEEPL_API_KEY, organization } = require('./config.json');
const fs = require("fs");
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ActivityType, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates] });
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const { createDiscordJSAdapter,  demuxProbe, createAudioPlayer,  joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType, createVoiceReceiver, voiceConnection, createListeningStream, AudioPlayerStatus, createAudioResource, StreamType } = require('@discordjs/voice');
const { Configuration, OpenAIApi } = require("openai");
const deepl = require('deepl-node');
const translator = new deepl.Translator(DEEPL_API_KEY);
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const { PassThrough } = require('stream');
const util = require('util');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const {Storage} = require('@google-cloud/storage');
const { SpeechClient } = require('@google-cloud/speech');
const ffmpeg = require('ffmpeg');
const { constants } = require('buffer');
const { OpusEncoder } = require('@discordjs/opus');
const projectId = "marv-378607";
const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const { promisify } = require('util');

async function authenticateImplicitWithAdc() {
	const storage = new Storage({
		projectId,
	});
	const [buckets] = await storage.getBuckets();
	console.log('Buckets:');

	for (const bucket of buckets) {
		console.log(`- ${bucket.name}`);
	}

	console.log('Listed all storage buckets.');
}

authenticateImplicitWithAdc();

const tts = new textToSpeech.TextToSpeechClient();
const stt = new speech.SpeechClient();

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

const player = createAudioPlayer();
module.exports = {player}
player.stop();

async function PlayMP3(resource) {
	resource = createAudioResource(path.join(__dirname, resource));
	player.play(resource);
}

async function synthesizeSpeech(text) {
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
	await writeFile('output.mp3', response.audioContent, 'binary');
	await PlayMP3('output.mp3')
	console.log('Audio content written to file: output.mp3');
}

async function reconizeSpeech(user, audioContent) {

	// The audio file's encoding, sample rate in hertz, and BCP-47 language code
	const audio = {
		content: audioContent 	
	};
	const config = {
		encoding: 'LINEAR16',
		sampleRateHertz: 48000,
		languageCode: 'fr-FR',
	};
	const request = {
		audio: audio,
		config: config,
	};

	// Detects speech in the audio file
	const [response] = await stt.recognize(request);
	const transcription = response.results
	.map(result => result.alternatives[0].transcript)
	.join('\n');
	console.log(`Transcription: ${user} a dit ${transcription}`);
}

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
		synthesizeSpeech(laReponse.replace('Marv :', '').replace('Marv:', ''));
		adminChannel.send('-------------------------');
		adminChannel.send('@' + laReponse);
	}
});

client.on('ready', () => {

	const connection = joinVoiceChannel({
		channelId: '1039788045441978371',
		guildId: '1039788044691181608',
		adapterCreator: client.guilds.cache.get('1039788044691181608').voiceAdapterCreator,
		selfDeaf: false,
		selfMute: false,
		group: client.user.id,
	});

	console.log("Listener Is Joining Voice And Listening...");

	const receiver = connection.receiver;

	receiver.voiceConnection.on(VoiceConnectionStatus.Ready, () => {
		console.log('The connection has entered the Ready state - ready to listen or to play audio!');
		connection.subscribe(player);	
	});

	async function probeAndCreateResource(readableStream) {
		const { stream, type } = await demuxProbe(readableStream);
		return createAudioResource(stream, { inputType: type });
	}
	
	receiver.speaking.on('start', async (UserId) => {
		let UserSpeaker = client.users.cache.get(UserId).username;
		console.log(`I'm now listening to ${UserSpeaker}`);
		
		let resource = createAudioResource(createReadStream(join(__dirname, 'marv.ogg')), {
			inputType: StreamType.OggOpus,
		});

		const oggStream = await probeAndCreateResource(createReadStream(join(__dirname, 'marv.ogg'))); 

		const oggBuffer = await promisify(fs.readFile)(join(__dirname, '/marv.ogg'));
		console.log(`type of ${typeof oggBuffer}`);
		if (client.users.cache.get(UserId) !== client.user) {
			console.log(`${UserSpeaker} a dit quelquechose !`); 
			//await reconizeSpeech(UserSpeaker, oggBuffer);
		}
		
	});

	receiver.speaking.on('stop', (UserId) => {
		let UserSpeaker = client.users.cache.get(UserId).username;
		console.log(`I'm no longer listening to ${UserSpeaker}`);
	});
	
	player.on(AudioPlayerStatus.Idle, () => {
		console.log('Audio player has become idle - no more audio to play!');
	});
	
})

// Log in to Discord with your client's token
client.login(token);