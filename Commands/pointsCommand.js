// Commands/pointsCommand.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPoints } = require('../Data/dataPoints');

async function registerPointsCommand(client) {
    const command = new SlashCommandBuilder()
        .setName('points')
        .setDescription('Check how many points you have.')
        .addUserOption(opt => opt.setName('user').setDescription('(Optional) User to check').setRequired(false));

    await client.application.commands.create(command);
}

async function handlePointsInteraction(interaction) {
    // optional target
    const userOption = interaction.options.getUser('user');
    const target = userOption || interaction.user;
    const pts = getPoints(target.id);

    const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('💎 Points')
        .setDescription(`${target.id === interaction.user.id ? 'You currently have' : `${target.username} currently has`} **${pts} points**.`)
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Earn more by inviting friends or joining giveaways!' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { registerPointsCommand, handlePointsInteraction };
