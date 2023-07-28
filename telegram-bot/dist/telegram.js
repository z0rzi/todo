"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = void 0;
const telegraf_1 = require("telegraf");
const env_1 = require("./env");
class Watcher {
    constructor(botKey) {
        this.intervalId = null;
        this.chatId = env_1.default('TELEGRAM_CHAT_ID', 'number');
        this.username = '';
        this.bot = new telegraf_1.Telegraf(botKey);
        this.bot.on('text', ctx => {
            // on command '/start'
            this.chatId = ctx.chat.id;
            ctx.reply(`${this.username} is watching...`);
        });
        this.bot.command('stop', () => (this.chatId = null));
        this.bot.hears('stop', () => (this.chatId = null));
        this.bot.launch();
        this.bot.telegram.getMe().then(infos => {
            this.username = infos.username;
            this.sendMessage(`${infos.username} just woke up 🥱`);
            console.log(`${infos.username} just started`);
        });
        // Enable graceful stop
        process.once('SIGINT', () => this.bot.stop('SIGINT'));
        process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    }
    update() {
        throw new Error('The update method should be overriden');
    }
    sendMessage(message) {
        if (this.chatId == null)
            return false;
        this.bot.telegram.sendMessage(this.chatId, message);
        console.log(`${this.username} - Sending message`);
        return true;
    }
    run(delay = 20000) {
        if (this.intervalId)
            this.stop();
        this.update();
        this.intervalId = setInterval(() => {
            this.update();
        }, delay);
    }
    stop() {
        clearInterval(this.intervalId);
    }
}
exports.Watcher = Watcher;
