// Commands/removePoints.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { loadPoints, savePoints } = require('../Data/dataPoints');

async function registerRemovePointsCommand(client) {
    const removePointsCommand = new SlashCommandBuilder()
        .setName('removepoints')
        .setDescription('Remove points from a user.')
        .addUserOption(opt => opt.setName('user').setDescription('User to remove points from.').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setDescription('Number of points to remove.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.create(removePointsCommand);
}

async function handleRemovePointsInteraction(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!user || !amount || amount <= 0) {
        return interaction.reply({ content: '⚠️ Please provide a valid user and amount (>0).', ephemeral: true });
    }

    const data = loadPoints();
    if (!data[user.id]) data[user.id] = { points: 0 };
    data[user.id].points = Math.max(0, data[user.id].points - amount);
    savePoints(data);

    const total = data[user.id].points;

    const embed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('❌ Points Update')
        .setDescription(`❌ **${user.username}** has lost **${amount} points.**\nHe/She now has a total of **${total} points.**`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Be careful... stay active to recover points! 🔥' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
}

module.exports = { registerRemovePointsCommand, handleRemovePointsInteraction };
