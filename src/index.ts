import { Client, GatewayIntentBits, REST, Routes } from "discord.js";
import Manga from "./Manga";

const client = new Client({ intents: GatewayIntentBits.Guilds });
const rest = new REST({ version: "10" }).setToken(Bun.env.DC_TOKEN || "").setToken(Bun.env.DC_TOKEN || "");

try {
  console.log("Started refreshing application");

  await rest.put(Routes.applicationGuildCommands(Bun.env.CLIENT_ID || "", Bun.env.GUILD_ID || ""));

  console.log("Successfully reloaded application");
} catch (error) {
  console.error(error);
}

client.on("ready", () => {
  new Manga(client);
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.login(Bun.env.DC_TOKEN);
