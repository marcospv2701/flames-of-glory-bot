// index.js — versión final y funcional para Render

import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import registerInvites from "./Scripts/invitesRegister.js"; // si existe

// Inicializar variables
dotenv.config();
const app = express();

// 🔥 Servidor web para mantener vivo el bot
app.get("/", (req, res) => {
  res.send("🔥 Flames of Glory Bot está activo y funcionando correctamente.");
});

// Render usa el puerto asignado en process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌐 Servidor web activo en puerto ${PORT}`));

// 🧩 Resolver __dirname (porque en ES Modules no existe)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🧠 Inicializar cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

client.commands = new Collection();

// 📂 Cargar comandos desde /Commands
const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const commandPath = path.join(commandsPath, file);
  const { data, execute } = await import(`file://${commandPath}`);
  if (data && execute) {
    client.commands.set(data.name, { data, execute });
    console.log(`✅ Cargado comando: ${data.name}`);
  } else {
    console.warn(`⚠️ El comando ${file} no tiene "data" o "execute".`);
  }
}

// 🟢 Conexión a MongoDB
if (process.env.MONGO_URI) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🟢 Conectado a MongoDB Atlas");
  } catch (err) {
    console.error("🔴 Error conectando a MongoDB:", err);
  }
} else {
  console.warn("⚠️ No se encontró la variable MONGO_URI en el entorno.");
}

// 🔔 Cuando el bot esté listo
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Conectado como ${c.user.tag}`);
  if (typeof registerInvites === "function") {
    await registerInvites(client);
  }
});

// ⚙️ Ejecución de comandos Slash
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Hubo un error ejecutando este comando.",
      ephemeral: true,
    });
  }
});

// 🚀 Login del bot
client.login(process.env.DISCORD_TOKEN);
    