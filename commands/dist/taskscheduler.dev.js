"use strict";

var _require = require('discord.js'),
    SlashCommandBuilder = _require.SlashCommandBuilder,
    ActionRowBuilder = _require.ActionRowBuilder,
    ButtonBuilder = _require.ButtonBuilder,
    ButtonStyle = _require.ButtonStyle,
    EmbedBuilder = _require.EmbedBuilder;

module.exports = {
  data: new SlashCommandBuilder().setName('newtask').setDescription('Crée une nouvelle tâche (version alpha).').addUserOption(function (option) {
    return option.setName('target').setDescription('Personne à qui la tâche revient').setRequired(true);
  }).addStringOption(function (option) {
    return option.setName('nom').setDescription('Nom de la tâche.').setRequired(true);
  }).addStringOption(function (option) {
    return option.setName('description').setDescription('Description de la tâche.').setRequired(true);
  }),
  execute: function execute(interaction) {
    var target, nom, description, avatar, embed, row;
    return regeneratorRuntime.async(function execute$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            target = interaction.options.getUser('target');
            nom = interaction.options.getString('nom');
            description = interaction.options.getString('description');
            avatar = target.displayAvatarURL();
            embed = new EmbedBuilder().setColor('#0099ff').setTitle("La t\xE2che ".concat(nom, " a \xE9t\xE9 attribu\xE9 \xE0 ").concat(target.userName)).setURL('http://bit-scripts.github.io/').setDescription(description).setThumbnail(avatar).setTimestamp();
            row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('accept').setLabel('Accepter').setStyle(ButtonStyle.Primary), new ButtonBuilder().setCustomId('abandon').setLabel('Refuser').setStyle(ButtonStyle.Danger));
            _context.next = 8;
            return regeneratorRuntime.awrap(interaction.reply({
              content: 'Nouvelle tâche créée' + target,
              embeds: [embed],
              components: [row]
            }));

          case 8:
          case "end":
            return _context.stop();
        }
      }
    });
  }
};