const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { removePoints } = require('../Data/dataPoints');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removepoints')
    .setDescription('Quita puntos a un usuario')
    .addUserOption(opt => opt.setName('user').setDescription('Usuario').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Cantidad').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) return interaction.reply({ content: 'La cantidad debe ser mayor que 0.', ephemeral: true });

    const total = await removePoints(user.id, amount);

    const embed = new EmbedBuilder()
      .setTitle('❌ Puntos removidos')
      .setDescription(`Se quitaron **${amount}** puntos a ${user.username}.\nTotal actual: **${total}** puntos.`)
      .setColor(0xE74C3C);

    await interaction.reply({ embeds: [embed] });
  },
};
