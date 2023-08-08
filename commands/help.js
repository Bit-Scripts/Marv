const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { GithubStats } = require('github-release-stats');
const gh = new GithubStats('Bit-Scripts', 'Low-Fuel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Marv va pouvoir vous comprendre'),	
    async execute(interaction) {
        var fs = require("fs");
        var fileToRead = 'README.md';
        fs.readFile(fileToRead, 'utf8', (err, data) => {
            if(err) {
                console.log(err.message);
            } else {
                const embed = new EmbedBuilder()
                .setTitle('Marv')
                .setColor('#C69B6D')
                .addFields(
                   {
                   name: "Marv",
                   value: "Marv est un chatbot qui répond aux questions à contrecœur. Il est écrit en Node.JS et utilise le traitement du langage naturel proposé par OpenAI. Il permet de comprendre les entrées de l'utilisateur et générer des réponses appropriées. Marv est conçu pour être un compagnon de conversation, fournissant des réponses pleines d'esprit aux questions et s'engageant dans un badinage léger.\n\nLe bot est écrit en nodejs et est utilisable directement sur votre serveur Discord.\n\nSi voulez l'ajoutez à votre serveur discord suivez les instructions présentes de ce dépôts Github https://github.com/Bit-Scripts/Marv",
                   },
                )
                .setImage('https://marv-bot.fr/images/botavatar.png')
                .setURL('https://github.com/Bit-Scripts/Marv')
                interaction.reply({ embeds: [embed] });
                const videoUrl = "https://www.youtube.com/watch?v=vNZ1ZO1RALE";
                const videoTitle = "Présentation de Marv";             
                setTimeout(() => {
                    interaction.followUp(`Voici la vidéo "${videoTitle}": ${videoUrl}`);
                }, 1500); 
            }
        });
    },
};