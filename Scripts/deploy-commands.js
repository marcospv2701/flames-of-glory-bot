require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 📦 Cargar todos los comandos
const commands = [];
const commandsPath = path.join(__dirname, '..', 'Commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        commands.push(command.data.toJSON());
        console.log(`✅ Cargado comando: ${command.data.name}`);
    } else {
        console.warn(`⚠️ El comando en ${file} no tiene "data" o "execute".`);
    }
}

// 📡 Crear instancia REST
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`⏳ Registrando ${commands.length} comandos...`);
        console.log(`🧩 CLIENT_ID: ${process.env.CLIENT_ID}`);
        console.log(`🧩 GUILD_ID: ${process.env.GUILD_ID}`);

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('✅ Comandos registrados correctamente.');
    } catch (error) {
        console.error('❌ Error registrando los comandos:', error);
    }
})();
