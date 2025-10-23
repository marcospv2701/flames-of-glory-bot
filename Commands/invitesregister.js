const { Client, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const registerInvites = require('./invitesRegister'); // 👈 Importamos tu sistema de invitaciones

// Crear el cliente con todas las intenciones necesarias
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

// Cuando el bot esté listo
client.once('ready', async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  await registerInvites(client); // 👈 Activamos el sistema de invitaciones
});

// Iniciar sesión
client.login(token);
// invitesRegister.js
const { Events } = require('discord.js');
const Database = require('better-sqlite3');

module.exports = async function registerInvites(client) {
  // Base de datos local
  const db = new Database('./points.db');
  db.prepare(`CREATE TABLE IF NOT EXISTS points (
      userId TEXT PRIMARY KEY,
      points INTEGER
  )`).run();

  const getPoints = (userId) => {
    const row = db.prepare('SELECT points FROM points WHERE userId = ?').get(userId);
    return row ? row.points : 0;
  };

  const addPoints = (userId, amount) => {
    const current = getPoints(userId);
    db.prepare('INSERT OR REPLACE INTO points (userId, points) VALUES (?, ?)').run(userId, current + amount);
  };

  // Guardar invitaciones existentes
  const invitesCache = new Map();

  client.guilds.cache.forEach(async (guild) => {
    const invites = await guild.invites.fetch();
    invitesCache.set(guild.id, new Map(invites.map(inv => [inv.code, inv.uses])));
  });

  console.log('📋 Sistema de invitaciones cargado y monitoreando servidores...');

  // Cuando alguien entra
  client.on(Events.GuildMemberAdd, async (member) => {
    try {
      const guild = member.guild;
      const newInvites = await guild.invites.fetch();
      const oldInvites = invitesCache.get(guild.id);
      const invite = newInvites.find(i => oldInvites.get(i.code) < i.uses);

      invitesCache.set(guild.id, new Map(newInvites.map(i => [i.code, i.uses])));

      if (invite && invite.inviter) {
        const inviter = invite.inviter;
        addPoints(inviter.id, 10);
        console.log(`👤 ${member.user.tag} fue invitado por ${inviter.tag} (+10 points)`);

        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
        if (channel) {
          channel.send(`🎉 ${member.user} fue invitado por ${inviter}. **+10 points** para ${inviter.username}! 💎`);
        }
      }
    } catch (err) {
      console.error('❌ Error al detectar la invitación:', err);
    }
  });

  // Si se crean o eliminan invitaciones, actualiza el cache
  client.on(Events.InviteCreate, invite => {
    const guildInvites = invitesCache.get(invite.guild.id) || new Map();
    guildInvites.set(invite.code, invite.uses);
    invitesCache.set(invite.guild.id, guildInvites);
  });

  client.on(Events.InviteDelete, invite => {
    const guildInvites = invitesCache.get(invite.guild.id);
    if (guildInvites) guildInvites.delete(invite.code);
  });
};
