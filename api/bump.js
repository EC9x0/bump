// api/bump.js
const { Client } = require('discord.js-selfbot-v13');

// ================================================================
// 🔑 PASTE YOUR CREDENTIALS HERE (DO NOT SHARE THIS FILE PUBLICLY)
// ================================================================
const DISCORD_TOKEN = 'MTUyMTI2NDI3NDE3MjAxODczOA.GSVXJS.vP4g7NWS85uELwbhO0TlLMTJZlmTUl9msUVQNM';
const GUILD_ID = '1496157632132812851';
const CHANNEL_ID = '1506245097656680470';
// Optional: list of bot application IDs (comma-separated string, or empty array)
// If empty, the script will execute ALL /bump commands found in the guild.
const TARGET_BOT_IDS = []; // e.g., ['302050872383242240', '123456789012345678']
// ================================================================

module.exports = async (req, res) => {
  // Use the hardcoded values instead of environment variables
  const token = DISCORD_TOKEN;
  const guildId = GUILD_ID;
  const channelId = CHANNEL_ID;
  const targetBotIds = TARGET_BOT_IDS;

  if (!token || !guildId || !channelId) {
    return res.status(400).send('Missing hardcoded credentials');
  }

  const client = new Client({ checkUpdate: false });

  try {
    await client.login(token);
    console.log('Logged in successfully');

    const guild = client.guilds.cache.get(guildId);
    if (!guild) throw new Error('Guild not found');

    const channel = guild.channels.cache.get(channelId);
    if (!channel) throw new Error('Channel not found');

    const commands = await client.api.guilds(guildId).commands.get();
    console.log(`Found ${commands.length} guild commands`);

    const bumpCommands = commands.filter(cmd =>
      cmd.name === 'bump' &&
      (targetBotIds.length === 0 || targetBotIds.includes(cmd.application_id))
    );

    console.log(`Executing ${bumpCommands.length} bump commands`);

    for (const cmd of bumpCommands) {
      try {
        await channel.sendSlash(cmd.id);
        console.log(`✅ Bumped with bot ${cmd.application_id} (${cmd.id})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`❌ Failed to bump with bot ${cmd.application_id}:`, err.message);
      }
    }

    await client.destroy();
    res.status(200).send('Bump cycle completed successfully');
  } catch (error) {
    console.error('Fatal error:', error);
    await client.destroy().catch(() => {});
    res.status(500).send(`Error: ${error.message}`);
  }
};

// At the very bottom of api/bump.js, add:
if (require.main === module) {
  // If run directly (node api/bump.js), call the function with dummy req/res
  const dummyReq = {};
  const dummyRes = {
    status: (code) => ({
      send: (msg) => console.log(`[${code}] ${msg}`)
    })
  };
  module.exports(dummyReq, dummyRes);
}