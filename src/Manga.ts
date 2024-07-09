import { FetchError, ofetch } from "ofetch";
import * as cheerio from "cheerio";
import { EmbedBuilder, type Client, type TextChannel } from "discord.js";

interface Links {
  [key: string]: string[];
}
export default class Manga {
  private links: Links = {};
  private webs: string[] = ["https://ww2.jujustukaisen.com/"];
  private client: Client;
  private generalChannel = "1038046334109892691";

  constructor(client: Client) {
    this.client = client;

    // Initial check
    this.startChecking();

    setInterval(() => this.startChecking(), 1000 * 2);
  }

  private async startChecking() {
    for (let i = 0; i < this.webs.length; i++) {
      await this.getPage(this.webs[i]);
    }
  }

  private async fetchHTML(url: string) {
    try {
      return await ofetch(url);
    } catch (error) {
      if (error instanceof FetchError) {
        console.error(error.message);
      }
    }
  }

  private async getPage(url: string) {
    const html = await this.fetchHTML(url);

    if (!html) {
      return;
    }

    const $ = cheerio.load(html);

    const latestChapterUrl = $("ul li ul li a").attr("href");
    const mangaTitle = $(".entry-title").text();
    const mangaCover = $("img").first().attr("src");

    if (!latestChapterUrl) {
      return;
    }

    if (!this.links[url]) {
      this.links[url] = [];
    }

    if (this.links[url][this.links[url].length - 1] !== latestChapterUrl) {
      this.links[url].push(latestChapterUrl);

      //   send to dc
      const channel = (await this.client.channels.fetch(this.generalChannel)) as TextChannel;
      const embed = new EmbedBuilder()
        .setTitle(latestChapterUrl)
        .setDescription(`${mangaTitle} just got a new chapter, come check it out`)
        .setURL(latestChapterUrl)
        .setImage(mangaCover ? mangaCover : null);

      channel.send({ content: `@everyone ${mangaTitle} just got a new chapter, come check it out`, embeds: [embed] });
    }
  }
}
