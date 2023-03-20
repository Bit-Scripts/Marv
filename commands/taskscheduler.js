const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('newtask')
        .setDescription('Crée une nouvelle tâche (version alpha).')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('Personne à qui la tâche revient')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nom de la tâche.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description de la tâche.')
                .setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const nom = interaction.options.getString('nom');
        const description = interaction.options.getString('description');
        const avatar = target.displayAvatarURL();
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`La tâche ${nom} a été attribué à ${target.userName}`)
            .setURL('http://bit-scripts.github.io/')
            .setDescription(description)
            .setThumbnail(avatar)
            .setTimestamp();
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept')
                    .setLabel('Accepter')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('abandon')
                    .setLabel('Refuser')
                    .setStyle(ButtonStyle.Danger),
            );
    
        await interaction.reply({ content: 'Nouvelle tâche créée' + target, embeds: [embed], components: [row] });
    },
};

