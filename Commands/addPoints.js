import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import Points from "../Models/Points.js";

export const data = new SlashCommandBuilder()
  .setName("addpoints")
  .setDescription("Añade puntos a un usuario")
  .addUserOption(option =>
    option.setName("usuario")
      .setDescription("Usuario al que quieres añadir puntos")
      .setRequired(true)
  )
  .addIntegerOption(option =>
    option.setName("cantidad")
      .setDescription("Cantidad de puntos a añadir")
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

  userData.points += cantidad;
  await userData.save();

  const embed = new EmbedBuilder()
    .setTitle("💎 Puntos añadidos")
    .setDescription(`Se añadieron **${cantidad}** puntos a **${user.username}**.`)
    .setColor("Green");

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
