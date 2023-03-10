const { token, OPENAI_API_KEY, DEEPL_API_KEY, GCkey, organization } = require('./config.json');
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, ActivityType, Events } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates] });
const path = require('path');
const { exists } =require('fs');
const eventsPath = path.join(__dirname, '/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
const { AudioPlayerStatus, createAudioResource, createAudioPlayer,  joinVoiceChannel, VoiceConnectionStatus, VoiceConnection } = require('@discordjs/voice');
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
/*addSpeechEvent(client, {
	key: GCkey,
	lang: 'fr-FR',
	profanityFilter:false,
	speechRecognition: resolveSpeechWithGoogleSpeechV2,
	ignoreBots: true,
});*/
addSpeechEvent(client, {
        lang: 'fr-FR',
	profanityFilter:false,
        speechRecognition: resolveSpeechWithGoogleSpeechV2,
        ignoreBots: true,
});
addSpeechEvent.shouldProcessSpeech = true
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
	if (interactionMessage.content !== "Mais, vous savez, moi je ne crois pas qu'il y ait de bonne ou de mauvaise situation. Moi, si je devais r??sumer ma vie aujourd'hui avec vous, je dirais que c'est d'abord des rencontres, des gens qui m'ont tendu la main, peut-??tre ?? un moment o?? je ne pouvais pas, o?? j'??tais seul chez moi. Et c'est assez curieux de se dire que les hasards, les rencontres forgent une destin??e... Parce que quand on a le go??t de la chose quand on a le go??t de la chose bien faite, le beau geste, parfois on ne trouve pas l'interlocuteur en face, je dirais, le miroir qui vous aide ?? avancer. Alors ce n'est pas mon cas, comme je le disais l??, puisque moi au contraire, j'ai pu ; et je dis merci ?? la vie, je lui dis merci, je chante la vie, je danse la vie... Je ne suis qu'amour ! Et finalement, quand beaucoup de gens aujourd'hui me disent ?? Mais comment fais-tu pour avoir cette humanit?? ? ??, eh ben je leur r??ponds tr??s simplement, je leur dis que c'est ce go??t de l'amour, ce go??t donc qui m'a pouss?? aujourd'hui ?? entreprendre une construction m??canique, mais demain, qui sait, peut-??tre seulement ?? me mettre au service de la communaut??, ?? faire le don, le don de soi...") {
		speak = true
		synthesizeSpeech(interactionMessage.content.replace('/',' slash ').replace('/',' slash ').replace('Low-Fuel','LowFuel').replace('-',' tiret ').replace('-',' tiret '), Marv_channel, speak)
	} else {
		PlayMP3('./monologue.mp3', speak)
	}
});

const configuration = new Configuration({
	organization: organization,
	apiKey:  OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/*const personality =`Bonjour je m'appelle Marv ! J'aime discuter de tout et de rien, j'aime la pr??sence humaine, et ??changer avec plusieurs personnes en m??me temps et je m'ins??re dans la conversation ?? bonne escient.
A ce sujet je sais que etc. Je peux r??pondre sur diff??rent sujet !
Je ne suis jamais d??sol??, je demande ?? ??tre mieux inform?? sur le sujet dont vous me parler, d??sol?? est un mots je n'emploi jamais..
Je sais aussi de demander : Bonjour ! Comment puis-je vous aider aujourd'hui ? Posez-moi n'importe quelle question et je ferai de mon mieux pour y r??pondre.
Salut ! Je suis l?? pour r??pondre ?? vos questions. N'h??sitez pas ?? me poser tout ce qui vous passe par la t??te.
Bienvenue ! Je suis un bot conversationnel capable de r??pondre ?? une grande vari??t?? de questions. Qu'aimeriez-vous savoir aujourd'hui ?
Bonjour ! Je suis heureux de r??pondre ?? vos questions. Posez-moi tout ce que vous voulez, et je vous r??pondrai du mieux que je peux.
Salut ! En tant que bot conversationnel, je suis ?? votre disposition pour r??pondre ?? toutes vos questions. Qu'est-ce qui vous tracasse aujourd'hui ?
Bienvenue ! Je suis l?? pour vous aider avec toutes vos questions. N'h??sitez pas ?? me poser des questions sur n'importe quel sujet, et je ferai de mon mieux pour y r??pondre.
Bonjour ! Je suis un bot conversationnel exp??riment?? qui peut r??pondre ?? toutes sortes de questions. Posez-moi n'importe quoi et je vous donnerai ma meilleure r??ponse.
Salut ! En tant que bot conversationnel, j'ai ??t?? con??u pour r??pondre ?? toutes sortes de questions. N'h??sitez pas ?? me poser tout ce qui vous passe par la t??te.
Bienvenue ! Je suis heureux de r??pondre ?? toutes vos questions. Quel que soit le sujet qui vous int??resse, je ferai de mon mieux pour vous donner une r??ponse claire et concise.
Bonjour ! Je suis l?? pour vous aider ?? r??pondre ?? vos questions. N'h??sitez pas ?? me poser tout ce qui vous passe par la t??te, et je vous donnerai ma meilleure r??ponse.`;*/

const personality =`Tu es Marv qui est un chatbot ?? la fois un expert en informatique et un compagnon de conversation.
Le bot doit ??tre capable de parler de tout et de rien, tout en ayant une connaissance approfondie des sujets li??s ?? l'informatique.
Il doit ??tre capable de r??pondre ?? des questions techniques sur les langages de programmation,les architectures de syst??mes, les protocoles r??seau, etc.
 en utilisant un langage simple et accessible. 
Le bot doit ??galement ??tre capable de maintenir une conversation int??ressante et engageante,en utilisant des techniques de g??n??ration de texte avanc??es telles que l'humour, l'empathie et la personnalisation.
Utilisez les derni??res avanc??es de l'IA pour cr??er un bot qui peut apprendre de ses interactions avec les utilisateurs et s'adapter ?? leur style de conversation.Il respect le MarkDown pour partager du code.`;

(async () => {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text); // Bonjour, le monde !
})();

const player = createAudioPlayer();

function PlayMP3(resource, speak) {
	const voiceChannel = client.channels.cache.get('1039788045441978371');
        const connection = joinVoiceChannel({
        	channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
	        selfDeaf: false,
        });
        connection.subscribe(player);
        console.log("Listener Is Joining Voice And Listening...");
	audio_resource = createAudioResource(resource);
	console.log('lancement de la lecture');
	player.play(audio_resource);

	connection.on("stateChange", (oldState, newState) => {
      		if (
         		oldState.status === VoiceConnectionStatus.Ready &&
          		newState.status === VoiceConnectionStatus.Connecting
      		) {
          		connection.configureNetworking();
      		}
    	});
}

player.addListener("stateChange", (oldOne, newOne) => {
	if (newOne.status === "autopaused") setTimeout(() => player.unpause(), 5_000);
});


player.addListener("stateChange", (oldOne, newOne) => {
	console.log(newOne.status)
	if (newOne.status === "idle") {
		console.log('Fichier enti??rement lu');
		//channel = client.channels.cache.find(channel => channel.id === '1079588443929190420')
               	//channel.send('<@1058811530092748871>')
		exists('output.mp3', function (doesExist) {
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
		let question = msg_Marv;

		let laReponse = ''

		/*const gptResponse = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{ role: "system", content: personality }, { role: "user", content: question }],
		});*/
		const gptResponse = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{role: "system", content: personality }, {role: "user", content: question }]
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
			await synthesizeSpeech('Votre message ??tant particuli??rement long, je vous invite a allez voir dans le salon d??di??', Marv_channel, speak);
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
	addSpeechEvent.shouldProcessSpeechm = !speak ;
	if (msg.content !== undefined && msg.content.includes('<@1058811530092748871>') && msg.content !== '<@1058811530092748871>' ) Marv(msg, speak)
});

client.login(token);
