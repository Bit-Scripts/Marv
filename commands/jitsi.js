const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jitsi')
        .setDescription(`Besoin d'une vidéoconférence rapide`),	
    async execute(interaction) {
        let token = crypto.randomBytes(64).toString('hex');
        interaction.reply(`Voici le lien de connexion à la vidéo conférance : "https://meet.jit.si/${token}"`);
    },
};