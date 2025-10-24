import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Points from "../Models/Points.js";

export const data = new SlashCommandBuilder()
  .setName("removepoints")
  .setDescription("Resta puntos a un usuario")
  .addUserOption(option =>
    option.setName("usuario")
      .setDescription("Usuario al que quitar puntos")
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName("cantidad")
      .setDescription("Cantidad de puntos a quitar")
      .setRequired(true)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction) {
  const user = interaction.options.getUser("usuario");
  const cantidad = interaction.options.getInteger("cantidad");

  let userData = await Points.findOne({ userId: user.id });
  if (!userData) {
    userData = new Points({ userId: user.id, points: 0 });
  }

  userData.points = Math.max(0, userData.points - cantidad);
  await userData.save();

  const embed = new EmbedBuilder()
    .setTitle("📉 Puntos eliminados")
    .setDescription(`Se eliminaron **${cantidad}** puntos a **${user.username}**.`)
    .setColor("Red");

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
