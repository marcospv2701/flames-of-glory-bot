// ======================
// Servidor web (para Render y UptimeRobot)
// ======================
import express from "express";
import dotenv from "dotenv";
import { Client, GatewayIntentBits, Collection, Events } from "discord.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import registerInvites from "./Scripts/invitesRegister.js"; // opcional si existe

dotenv.config();
const app = express();

// Ruta básica para verificar que está vivo
app.get("/", (req, res) => {
  res.send("🔥 Flames of Glory Bot está vivo y funcionando 🔥");
});

// Render necesita que el servicio escuche en un puerto
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Servidor web activo en puerto ${PORT}`);
});


// ======================
// Discord Bot
// ======================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

client.commands = new Collection();

// Cargar comandos
const __dirname = path.resolve();
const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./Commands/${file}`);
  if (command.default?.data && command.default?.execute) {
    client.commands.set(command.default.data.name, command.default);
    console.log(`✅ Cargado comando: ${command.default.data.name}`);
  } else if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Cargado comando: ${command.data.name}`);
  } else {
    console.warn(`⚠️ El comando ${file} no tiene "data" o "execute".`);
  }
}

// ======================
// Conexión a MongoDB
// ======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Conectado a MongoDB Atlas"))
  .catch(err => console.error("🔴 Error conectando a MongoDB:", err));

// ======================
// Eventos del bot
// ======================
client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  if (typeof registerInvites === "function") {
    await registerInvites(client);
  }
});

// ======================
// Ejecución de comandos
// ======================
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "Hubo un error ejecutando este comando.",
      ephemeral: true,
    });
  }
});

// ======================
// Login
// ======================
client.login(process.env.DISCORD_TOKEN);
