import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import Points from "../Models/Points.js";

export const data = new SlashCommandBuilder()
  .setName("points")
  .setDescription("Muestra los puntos de un usuario")
  .addUserOption(option =>
    option.setName("usuario")
      .setDescription("Usuario para consultar (opcional)")
  );

export async function execute(interaction) {
  const user = interaction.options.getUser("usuario") || interaction.user;
  let userData = await Points.findOne({ userId: user.id });

  const points = userData ? userData.points : 0;

  const embed = new EmbedBuilder()
    .setTitle(`🏆 Puntos de ${user.username}`)
    .setDescription(`Tiene **${points}** puntos.`)
    .setColor("Blue");

  await interaction.reply({ embeds: [embed] });
}
