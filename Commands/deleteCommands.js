const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`🧹 Logged in as ${client.user.tag}`);

    // Obtener todos los comandos globales
    const commands = await client.application.commands.fetch();

    // Buscar y eliminar el comando "points"
    const oldCommand = commands.find(cmd => cmd.name === 'points');
    if (oldCommand) {
        await client.application.commands.delete(oldCommand.id);
        console.log(`✅ Comando /${oldCommand.name} eliminado correctamente.`);
    } else {
        console.log('⚠️ No se encontró el comando /points.');
    }

    process.exit(0);
});

client.login(token);
