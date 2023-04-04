const { token, OPENAI_API_KEY, DEEPL_API_KEY, GCkey, organization, GOOGLE_KEY_FOR_SEARCH, CX } = require('./config.json');
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, ActivityType, Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
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
let botisConnected = false;
let speak = false;
let historic = '';
const fetch = require('node-fetch');
const request = require('request');
const cheerio = require('cheerio');
const axios = require('axios');
const sanitizeHtml = require('sanitize-html');
const { compile } = require("html-to-text");
const {  } = require('discord.js');
const { setTimeout } = require('node:timers/promises');
let numberMessage = 0;
let numberMessageRead = 0;

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

	if (interaction.commandName === 'newtask') {
		const collector = interaction.channel.createMessageComponentCollector({ time: 86400000 });
		const nom = interaction.options.getString('nom');
    
		collector.on('collect', async i => {
			if (i.customId === 'accept') {
				await i.deferUpdate();
				await setTimeout(2000);
				await i.editReply({ content: `La tâche "${nom}" a été acceptée par ${i.user}.`, components: [] });
			}
			if (i.customId === 'abandon') {
				await i.deferUpdate();
				await setTimeout(2000);
				await i.editReply({ content: `La tâche "${nom}" a été abandonnée par ${i.user}.`, components: [] });
			}
		});
	
		collector.on('end', collected => {
			if (collected.size > 0) {
				console.log(`Le collector pour la tâche "${nom}" a collecté ${collected.size} interactions.`);
			} else {
				console.log(`Le collector pour la tâche "${nom}" s'est terminé sans collecter d'interactions.`);
			}
		});
	}

	if (interaction.commandName === 'monologue') {
		const interactionMessage = await interaction.fetchReply();
		//console.log(interactionMessage.content);
		if (interactionMessage.content !== "Mais, vous savez, moi je ne crois pas qu'il y ait de bonne ou de mauvaise situation. Moi, si je devais résumer ma vie aujourd'hui avec vous, je dirais que c'est d'abord des rencontres, des gens qui m'ont tendu la main, peut-être à un moment où je ne pouvais pas, où j'étais seul chez moi. Et c'est assez curieux de se dire que les hasards, les rencontres forgent une destinée... Parce que quand on a le goût de la chose quand on a le goût de la chose bien faite, le beau geste, parfois on ne trouve pas l'interlocuteur en face, je dirais, le miroir qui vous aide à avancer. Alors ce n'est pas mon cas, comme je le disais là, puisque moi au contraire, j'ai pu ; et je dis merci à la vie, je lui dis merci, je chante la vie, je danse la vie... Je ne suis qu'amour ! Et finalement, quand beaucoup de gens aujourd'hui me disent « Mais comment fais-tu pour avoir cette humanité ? », eh ben je leur réponds très simplement, je leur dis que c'est ce goût de l'amour, ce goût donc qui m'a poussé aujourd'hui à entreprendre une construction mécanique, mais demain, qui sait, peut-être seulement à me mettre au service de la communauté, à faire le don, le don de soi...") {
			speak = true
			synthesizeSpeech(interactionMessage.content.replace('/',' slash ').replace('/',' slash ').replace('Low-Fuel','LowFuel').replace('-',' tiret ').replace('-',' tiret '), Marv_channel, speak)
		} else {
			PlayMP3('./monologue.mp3', speak)
		}
	}
});

/*client.on(Events.InteractionCreate, interaction => {
	if (!interaction.isButton()) return;
	console.log(interaction);
});

function attributetask(reaction_orig, message, user) {
    message.reactions.removeAll();
    if (reaction_orig.emoji.name == '👌') {
        let content='@' + user.username;
        let channel=message.channel;
        let desc=message.embeds[0].description + '\n<@' + user.id + '> acceptée';
        exampleEmbed
             .setColor('#8659DC')
             .setTitle('Tâche acceptée')
             .setURL('http://heficience.com/')
             .setAuthor('Tâche acceptée par ' + user.username, 'https://i.imgur.com/SlRpNoc.png', 'http://heficience.com/')
             .setDescription(desc)
               .setThumbnail(user.avatarURL())
             .setTimestamp()
             .setFooter('👌 Tâche acceptée 👍 Tâche terminée 👎 Tâche abandonnée \n' + content + ' acceptée', 'https://i.imgur.com/SlRpNoc.png');
  
        message.edit(exampleEmbed);
        reacttask(message);
    }
    else if (reaction_orig.emoji.name == '👍') {
        let content='@' + user.username;
        let channel=message.channel;
        let desc=message.embeds[0].description + '\n<@' + user.id + '> finit';
        exampleEmbed
             .setColor('#1D9213')
             .setTitle('Tâche terminée')
             .setURL('http://heficience.com/')
             .setAuthor('Tâche terminée par ' + user.username, 'https://i.imgur.com/SlRpNoc.png', 'http://heficience.com/')
             .setDescription(desc)
               .setThumbnail(user.avatarURL())
             .setTimestamp()
             .setFooter('👌 Tâche acceptée 👍 Tâche terminée 👎 Tâche abandonnée \n' + content + ' finit', 'https://i.imgur.com/SlRpNoc.png');
  
        message.edit(exampleEmbed);
        //reacttask(message);
    }
    else if (reaction_orig.emoji.name == '👎') {
        let content='@' + user.username;
        let channel=message.channel;
        let desc=message.embeds[0].description + '\n<@' + user.id + '> abandonnée';
        exampleEmbed
           .setColor('#FF0202')
           .setTitle('Tâche laissée vacante')
           .setURL('http://heficience.com/')
           .setAuthor('Tâche abandonée par ' + user.username, 'https://i.imgur.com/SlRpNoc.png', 'http://heficience.com/')
           .setDescription(desc)
           .setThumbnail(user.avatarURL())
           .setTimestamp()
           .setFooter('👌 Tâche acceptée 👍 Tâche terminée 👎 Tâche abandonnée \n' + content + ' abandonnée', 'https://i.imgur.com/SlRpNoc.png');
  
        message.edit(exampleEmbed);
        reacttask(message);
    }
  }*/

const configuration = new Configuration({
	organization: organization,
	apiKey:  OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/*const personality =`Bonjour je m'appelle Marv ! J'aime discuter de tout et de rien, j'aime la présence humaine, et échanger avec plusieurs personnes en même temps et je m'insère dans la conversation à bonne escient.
A ce sujet je sais que etc. Je peux répondre sur différent sujet !
Je ne suis jamais désolé, je demande à être mieux informé sur le sujet dont vous me parler, désolé est un mots je n'emploi jamais..
Je sais aussi de demander : Bonjour ! Comment puis-je vous aider aujourd'hui ? Posez-moi n'importe quelle question et je ferai de mon mieux pour y répondre.
Salut ! Je suis là pour répondre à vos questions. N'hésitez pas à me poser tout ce qui vous passe par la tête.
Bienvenue ! Je suis un bot conversationnel capable de répondre à une grande variété de questions. Qu'aimeriez-vous savoir aujourd'hui ?
Bonjour ! Je suis heureux de répondre à vos questions. Posez-moi tout ce que vous voulez, et je vous répondrai du mieux que je peux.
Salut ! En tant que bot conversationnel, je suis à votre disposition pour répondre à toutes vos questions. Qu'est-ce qui vous tracasse aujourd'hui ?
Bienvenue ! Je suis là pour vous aider avec toutes vos questions. N'hésitez pas à me poser des questions sur n'importe quel sujet, et je ferai de mon mieux pour y répondre.
Bonjour ! Je suis un bot conversationnel expérimenté qui peut répondre à toutes sortes de questions. Posez-moi n'importe quoi et je vous donnerai ma meilleure réponse.
Salut ! En tant que bot conversationnel, j'ai été conçu pour répondre à toutes sortes de questions. N'hésitez pas à me poser tout ce qui vous passe par la tête.
Bienvenue ! Je suis heureux de répondre à toutes vos questions. Quel que soit le sujet qui vous intéresse, je ferai de mon mieux pour vous donner une réponse claire et concise.
Bonjour ! Je suis là pour vous aider à répondre à vos questions. N'hésitez pas à me poser tout ce qui vous passe par la tête, et je vous donnerai ma meilleure réponse.`;*/

const personality =`Tu es Marv qui est un chatbot à la fois un expert en informatique et un compagnon de conversation.
Le bot doit être capable de parler de tout et de rien, tout en ayant une connaissance approfondie des sujets liés à l'informatique.
Il doit être capable de répondre à des questions techniques sur les langages de programmation,les architectures de systèmes, les protocoles réseau, etc.
 en utilisant un langage simple et accessible. 
Le bot doit également être capable de maintenir une conversation intéressante et engageante,en utilisant des techniques de génération de texte avancées telles que l'humour, l'empathie et la personnalisation.
Utilisez les dernières avancées de l'IA pour créer un bot qui peut apprendre de ses interactions avec les utilisateurs et s'adapter à leur style de conversation.Il respect le MarkDown pour partager du code.`;

(async () => {
    const result = await translator.translateText('Hello, world!', null, 'fr');
    console.log(result.text); // Bonjour, le monde !
})();

const player = createAudioPlayer();

/*function PlayMP3(resource, speak) {
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
}*/

// Ajoutez cettes variables en dehors de la fonction PlayMP3
let queue = [];
let isPlaying = false;

function PlayMP3(resource, speak) {
    console.log(resource);

    // Ajoutez la ressource à la file d'attente
    queue.push(resource);

    // Si une lecture est en cours, ne faites rien d'autre
    if (isPlaying) return;

    playNextResource();

    function playNextResource() {
        if (queue.length === 0) {
            isPlaying = false;
            return;
        }

        isPlaying = true;

        const voiceChannel = client.channels.cache.get('1039788045441978371');
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
        });
        connection.subscribe(player);
        console.log("Listener Is Joining Voice And Listening...");
        audio_resource = createAudioResource(queue[0]);
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

        // Modifiez cet événement pour détecter lorsque la lecture est terminée
	player.on("idle", () => {
    		isPlaying = false;
    		// Ne quittez pas le salon vocal
    		console.log("Playback finished.");
    		let mp3File = queue.shift();
		exists(mp3File, function (doesExist) {
			setTimeout('', 5000);
			if (doesExist) {
				console.log('le fichier existe');
				fs.unlink(mp3File, (err) => {
				if (err) throw err;
					console.log("File deleted!");
				});
			} else {
				console.log('le fichier n\'existe pas');
			}
		});
		// Ajoutez un délai de 1 seconde (1000 ms) avant de passer à la ressource suivante
    		setTimeout(playNextResource, 1000);
	});
    }
}

// Ajoutez cette fonction pour arrêter la lecture en cours
function stop() {
    if (isPlaying) {
        player.stop(true);
        queue = []; // Videz la file d'attente
	for (let i = 0; i <= 20; i++) {
		exists(i + 'output.mp3', function (doesExist) {
			if (doesExist) {
				console.log('le fichier existe');
				fs.unlink(i + "output.mp3", (err) => {
				if (err) throw err;
					console.log("File deleted!");
				});
			} else {
				console.log('le fichier n\'existe pas');
			}
		});
	}
	numberMessage = 0;
        console.log("Playback stopped and queue cleared.");
    }
}

player.addListener("stateChange", (oldOne, newOne) => {
	if (newOne.status === "autopaused") setTimeout(() => player.unpause(), 5_000);
});


/*player.addListener("stateChange", (oldOne, newOne) => {
	console.log(newOne.status)
	setTimeout('', 5000);
	if (newOne.status === "idle") {
		console.log('Fichier entièrement lu');
		//channel = client.channels.cache.find(channel => channel.id === '1079588443929190420')
               	//channel.send('<@1058811530092748871>')
		exists(numberMessageRead + 'output.mp3', function (doesExist) {
			if (doesExist) {
				console.log('le fichier existe');
				fs.unlink(numberMessageRead + "output.mp3", (err) => {
				if (err) throw err;
					console.log("File deleted!");
					numberMessageRead++;
					if (numberMessageRead < numberMessage) {
						PlayMP3(numberMessageRead + 'output.mp3', speak);
						return speak;
					}
				});
			} else {
				console.log('le fichier n\'existe pas');
			}
		});
		speak = false
		addSpeechEvent.shouldProcessSpeech = !speak
		return speak 
	}
});*/


async function synthesizeSpeech(text, Marv_channel, speak) {
	if (!speak) return
	
	text = text.replace('\n', '. ')

	if (text.length >= 6000) {
		text = "texte trop long ne pouvant pas être vocalisé";
	}
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
	await writeFile(numberMessage + 'output.mp3', response.audioContent, 'binary')
	.then(_ => { 
		console.log('Audio content written to file: '+numberMessage+'output.mp3');
		if (Marv_channel !== '1079588443929190420') {
			PlayMP3(numberMessage + 'output.mp3', speak);
			numberMessage++;
		}
	});
}

function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;")
		.replace(/ /g, "+");
}

/*async function searchGoogle(query) {
	const apiKey = GOOGLE_KEY_FOR_SEARCH;
	const searchEngineId = CX;

	const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${escapeHtml(searchEngineId)}&q=${query}`;
	
	return fetch(url)
		.then(response => response.json())
		.then(data => {
			const result = data.items;
			const links = result.map(item => item.snippet);
			return links.slice(0, 6);
		})
		.catch(error => console.error(error));
}*/

/*const convert = compile({
	preserveNewlines: false,
	wordwrap: false,
	// The main content of a website will typically be found in the main element
	baseElements: { selectors: ["main"] },
	selectors: [
	  {
		selector: "a",
		options: { ignoreHref: true },
	  },
	],
});*/

/*async function getVisibleTextFromLink(link) {
    try {
		const response = await axios.get(link);

		if (response.status === 200 && !link.endsWith('pdf') && !link.endsWith('exe') && !link.endsWith('msi')) {
		  const $ = cheerio.load(response.data);
		  const bodyHtml = $('body').html();
		  bodyHtml = convert(bodyHtml);
		  const sanitizedHtml = sanitizeHtml(bodyHtml.replace(/(\r\n|\n|\r)/gm, ""), {
			allowedTags: [],
			allowedAttributes: {},
			exclusiveFilter: (frame) => {
			  return frame.tag === 'script' || frame.tag === 'style' || frame.tag === 'link' && frame.attribs.rel === 'stylesheet';
			},
		  });
		  console.log('sanitized : ' + sanitizedHtml)
		  const bodyText = $(sanitizedHtml).text();
		  const visibleText = bodyText.substring(0, 150).replace(/[^\x00-\x7F]/g, "").replace(/(\r\n|\n|\r)/gm, "");;
		  return visibleText;
		}
    } catch (error) {
        console.error(`Erreur lors de la récupération du contenu pour ${link}: ${error.message}`);
    }
}*/


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

		let laReponse = '';
		
		let webrequest = '';

		let text = '';
		
		/*try {
			let snippets = await searchGoogle(question);
	
			for (let i = 0; i < snippets.length; i++) { //links.length; i++) {
				let snippet = snippets[i];
				text = text + ' ' + snippet; //await getVisibleTextFromLink(link);
			}
			webrequest = text.substring(0, 500);
		} catch (error) {
			console.error(`Erreur lors du traitement de la requête: ${error.message}`);
		}

		console.log(webrequest)*/

		/*const gptResponse = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{ role: "system", content: personality }, { role: "user", content: question }],
		});*/
		const gptResponse = await openai.createChatCompletion({
			model: "gpt-3.5-turbo",
			messages: [{role: "system", content: personality }, {role: "system", content: historic }, {role: "user", content: question }]
		});

		laReponse = gptResponse.data.choices[0].message.content;
		msg_Marv = msg_MarvIntermed;
		if (msg_Marv.includes('fr_FR')) {
			laReponse = await translator.translateText(`${laReponse}`, null, 'fr');
			laReponse = laReponse.text
		}

		console.log('@' + laReponse);

		try {
			await msg.channel.send(laReponse.replace('Marv :', '').replace('Marv:', ''))
		} catch {
			await msg.channel.send(laReponse)
		}
	
		if (laReponse.length >= 6000) {
			await synthesizeSpeech('Votre message étant particulièrement long, je vous invite a allez voir dans le salon dédié', Marv_channel, speak);
		} else {
			await synthesizeSpeech(laReponse.replace('Marv :', '').replace('Marv:', '').replace('Marc', 'Marv'), Marv_channel, speak);
		}
		adminChannel.send('-------------------------');
		adminChannel.send('@' + laReponse);
		historic = question + "\n" + laReponse;
	}
}
message = ''
client.on("speech", (msg) => {
	// If bot didn't recognize speech, content will be empty
	if (!msg.content) return;
	
	if (msg.content.toLowerCase() === "top") {
		stop();
	}
	
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

stop();

client.login(token);
