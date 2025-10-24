const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { addPoints } = require('../Data/dataPoints');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpoints')
    .setDescription('Añade puntos a un usuario')
    .addUserOption(opt => opt.setName('user').setDescription('Usuario').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Cantidad').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (amount <= 0) return interaction.reply({ content: 'La cantidad debe ser mayor que 0.', ephemeral: true });

    const total = await addPoints(user.id, amount);

    const embed = new EmbedBuilder()
      .setTitle('💎 Puntos añadidos')
      .setDescription(`Se añadieron **${amount}** puntos a ${user.username}.\nTotal actual: **${total}** puntos.`)
      .setColor(0x00B894);

    await interaction.reply({ embeds: [embed] });
  },
};
