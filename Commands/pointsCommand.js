const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getPoints } = require('../Data/dataPoints');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('points')
    .setDescription('Muestra tus puntos actuales'),
  async execute(interaction) {
    const total = await getPoints(interaction.user.id);

    const embed = new EmbedBuilder()
      .setTitle('🏆 Tus puntos')
      .setDescription(`Tienes **${total} puntos**.`)
      .setColor(0xFFD700);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
