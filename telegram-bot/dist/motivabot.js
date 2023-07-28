"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
const env_1 = tslib_1.__importDefault(require("./env"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const telegraf_1 = require("telegraf");
const allQuotes = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, '../assets', 'quotes.json'), { encoding: 'utf8' }));
const bot = new telegraf_1.Telegraf(env_1.default('BOT_ID'));
let username = '';
// bot.on('text', ctx => {
//     // on command '/start'
//     // ctx.reply(`${username} is watching...`);
// });
bot.command('stop', ctx => {
    ctx.reply(`Bye 👋`);
});
bot.command('start', ctx => {
    ctx.reply(`Hi! 😊`);
});
bot.command('quote', ctx => {
    const quote = allQuotes[(Math.random() * allQuotes.length) >> 0];
    ctx.reply(quote);
});
// bot.start((ctx) => {
//     ctx.reply(`Noope...`);
// });
// bot.command('stop', () => (this.chatId = null));
// bot.hears('stop', () => (this.chatId = null));
bot.launch();
bot.telegram.getMe().then(infos => {
    username = infos.username;
    console.log(`${infos.username} just started`);
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
