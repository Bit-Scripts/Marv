const { SlashCommandBuilder } = require('discord.js');

const { GithubStats } = require('github-release-stats');
const gh = new GithubStats('Bit-Scripts', 'Low-Fuel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lf_dl')
        .setDescription('Connaître le nombre de téléchargements de Low-Fuel'),	
    async execute(interaction) {
        await gh.getTotalDownloads().then(count => {
            interaction.reply(`Nombre total de téléchargements de Low-Fuel : ${count}.\nPlus d'info sur github.com/Bit-Scripts/Low-Fuel`);
        }).catch(error => {
            console.error(error.message);
        });
    },
};