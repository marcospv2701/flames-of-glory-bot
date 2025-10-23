// Commands/addPoints.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addPoints } = require('../Data/dataPoints');

async function registerAddPointsCommand(client) {
    const addPointsCommand = new SlashCommandBuilder()
        .setName('addpoints')
        .setDescription('Add points to a user.')
        .addUserOption(opt => opt.setName('user').setDescription('User to give points to.').setRequired(true))
        .addIntegerOption(opt => opt.setName('amount').setDescription('Number of points to add.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.create(addPointsCommand);
}

async function handleAddPointsInteraction(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!user || !amount || amount <= 0) {
        return interaction.reply({ content: '⚠️ Please provide a valid user and amount (>0).', ephemeral: true });
    }

    const total = addPoints(user.id, amount);

    const embed = new EmbedBuilder()
        .setColor(0xFF4500)
        .setTitle('💎 Points Update')
        .setDescription(`✅ **${user.username}** has received **${amount} points.**\nHe/She now has a total of **${total} points.**`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Keep earning points and climb the leaderboard! 💪' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
}

module.exports = { registerAddPointsCommand, handleAddPointsInteraction };
