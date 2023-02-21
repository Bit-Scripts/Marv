const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const { GITHUB_TOKEN } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clone_of_marv')
        .setDescription('Connaître le nombre de git clones de Marv'),	
    async execute(interaction) {
        try {
            const response = await axios.get('https://api.github.com/repos/Bit-Scripts/Marv/traffic/clones', {
                headers: {
                    Authorization: 'token ' + GITHUB_TOKEN
                },
                responseType: 'json'
            });
            interaction.reply(`Marv a été cloné : ${response.data.count} fois\nPlus d'infos ici https://github.com/Bit-Scripts/Marv`);
        } catch (error) {
            console.error(error);
            interaction.reply('Il y a eu une erreur lors de la récupération des informations de clonage de Marv.');
        }
    },
};