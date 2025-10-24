// Scripts/invitesRegister.js
import dotenv from "dotenv";
import { Collection } from "discord.js";
import mongoose from "mongoose";

dotenv.config();

export default async function registerInvites(client) {
  try {
    console.log("📨 Iniciando sistema de invitaciones...");

    // Conexión a MongoDB (opcional, solo si lo usas)
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ Conectado a la base de datos MongoDB");
    }

    // Crear colección para las invitaciones
    client.invites = new Collection();

    // Cuando el bot esté listo
    client.once("ready", async () => {
      const guild = client.guilds.cache.first();
      if (!guild) return console.log("⚠️ No se encontró ningún servidor.");

      const invites = await guild.invites.fetch();
      client.invites.set(guild.id, invites);

      console.log("✅ Sistema de invitaciones registrado correctamente");
    });

    // Cuando se cree una nueva invitación
    client.on("inviteCreate", async (invite) => {
      const invites = await invite.guild.invites.fetch();
      client.invites.set(invite.guild.id, invites);
    });

    // Cuando se use una invitación
    client.on("guildMemberAdd", async (member) => {
      const cachedInvites = client.invites.get(member.guild.id);
      const newInvites = await member.guild.invites.fetch();
      const usedInvite = newInvites.find(
        (inv) => cachedInvites.get(inv.code)?.uses < inv.uses
      );

      const inviter = usedInvite?.inviter;
      if (inviter) {
        console.log(`👋 ${member.user.tag} fue invitado por ${inviter.tag}`);
      }

      client.invites.set(member.guild.id, newInvites);
    });
  } catch (error) {
    console.error("❌ Error en el sistema de invitaciones:", error);
  }
}
