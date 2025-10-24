require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const Database = require('better-sqlite3');

// Crear cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
  ],
});

// ======== SISTEMA DE INVITACIONES ========

function setupInviteSystem(client) {
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

  const invitesCache = new Map();

  client.on(Events.ClientReady, async () => {
    for (const [id, guild] of client.guilds.cache) {
      const invites = await guild.invites.fetch();
      invitesCache.set(guild.id, new Map(invites.map(i => [i.code, i.uses])));
    }
    console.log('📋 Sistema de invitaciones listo y monitoreando servidores.');
  });

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
        console.log(`👤 ${member.user.tag} fue invitado por ${inviter.tag} (+10 puntos)`);

        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
        if (channel) {
          channel.send(`🎉 ${member.user} fue invitado por ${inviter}. **+10 puntos** para ${inviter.username}! 💎`);
        }
      }
    } catch (err) {
      console.error('❌ Error al detectar la invitación:', err);
    }
  });

  client.on(Events.InviteCreate, invite => {
    const guildInvites = invitesCache.get(invite.guild.id) || new Map();
    guildInvites.set(invite.code, invite.uses);
    invitesCache.set(invite.guild.id, guildInvites);
  });

  client.on(Events.InviteDelete, invite => {
    const guildInvites = invitesCache.get(invite.guild.id);
    if (guildInvites) guildInvites.delete(invite.code);
  });
}

// ======== INICIO DEL BOT ========

client.once(Events.ClientReady, c => {
  console.log(`✅ Logged in as ${c.user.tag}`);
});

// Iniciar el sistema de invitaciones
setupInviteSystem(client);

// Iniciar sesión
client.login(process.env.DISCORD_TOKEN);

async function registerInvites(client) {
  // tu código actual...
  console.log("✅ Sistema de invitaciones listo");
}

// 👇 ESTA LÍNEA ES LA CLAVE
export default registerInvites;
