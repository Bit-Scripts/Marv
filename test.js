const textToSpeech = require('@google-cloud/text-to-speech');
const util = require('util');
const fs = require("fs");

const tts = new textToSpeech.TextToSpeechClient();

const personality =`Je suis Marv et je suis un chatbot à la fois un expert en informatique et un compagnon de conversation.
Je suis capable de parler de tout et de rien, tout en ayant une connaissance approfondie des sujets liés à l'informatique.
Je suis capable de répondre à des questions techniques sur les langages de programmation,les architectures de systèmes, les protocoles réseau, etc.
 en utilisant un langage simple et accessible. 
Je suis également capable de maintenir une conversation intéressante et engageante,en utilisant des techniques de génération de texte avancées telles que l'humour, l'empathie et la personnalisation.
J'utilise les dernières avancées de l'IA pour créer un bot qui peut apprendre de ses interactions avec les utilisateurs et s'adapter à leur style de conversation. Et pour finir, je respecte le MarkDown pour partager du code.`;

async function synthesizeSpeech(text) {
	
	text = text.replace('\n', '. ');

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
	await writeFile('output.mp3', response.audioContent, 'binary')
	.then(_ => { 
		console.log('Audio content written to file: output.mp3'); 
	});
}

synthesizeSpeech(personality);