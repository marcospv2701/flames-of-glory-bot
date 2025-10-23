// index.js
require('dotenv').config(); // lee .env en local, ignorado por git
const { 
    Client, 
    GatewayIntentBits, 
    Events, 
    SlashCommandBuilder 
} = require('discord.js');

const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('❌ No Discord token found. Set DISCORD_TOKEN in .env or environment variables.');
    process.exit(1);
}

// Importar comandos
const { registerPointsCommand, handlePointsInteraction } = require('./Commands/pointsCommand');
const { registerAddPointsCommand, handleAddPointsInteraction } = require('./Commands/addPoints');
const { registerRemovePointsCommand, handleRemovePointsInteraction } = require('./Commands/removePoints');

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async c => {
    console.log(`✅ Logged in as ${c.user.tag}`);

    // Registrar /system points (subcommand)
    const systemCommand = new SlashCommandBuilder()
        .setName('system')
        .setDescription('System-related commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('points')
                .setDescription('See how you can earn and use points!')
        );

    await client.application.commands.create(systemCommand);
    console.log("✅ Command /system points registered.");

    // Registrar otros comandos (await para asegurar que terminen)
    try {
        await registerPointsCommand(client);
        console.log("✅ Command /points registered.");

        await registerAddPointsCommand(client);
        console.log("✅ Command /addpoints registered.");

        await registerRemovePointsCommand(client);
        console.log("✅ Command /removepoints registered.");
    } catch (err) {
        console.error('❌ Error registering commands:', err);
    }
});

// Escuchar interacciones y delegar
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    try {
        switch (interaction.commandName) {
            case 'points':
                await handlePointsInteraction(interaction);
                break;
            case 'addpoints':
                await handleAddPointsInteraction(interaction);
                break;
            case 'removepoints':
                await handleRemovePointsInteraction(interaction);
                break;
            case 'system':
                if (interaction.options.getSubcommand() === 'points') {
                    await interaction.reply({
                        content: "💡 You can earn points by being active and inviting new members!",
                        ephemeral: true
                    });
                }
                break;
            default:
                await interaction.reply({ content: "❓ Unknown command.", ephemeral: true });
        }
    } catch (error) {
        console.error('⚠️ Error handling interaction:', error);
        if (!interaction.replied) {
            await interaction.reply({ content: "❌ There was an error executing the command.", ephemeral: true });
        }
    }
});

client.login(token);
