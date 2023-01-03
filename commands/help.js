const { SlashCommandBuilder } = require('discord.js');

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
                interaction.reply(data);
            }
        });
    },
};