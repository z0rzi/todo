"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
const openai_1 = require("openai");
const env_1 = tslib_1.__importDefault(require("./env"));
const telegraf_1 = require("telegraf");
const configuration = new openai_1.Configuration({
    apiKey: env_1.default('OPENAI_API_KEY'),
});
const openai = new openai_1.OpenAIApi(configuration);
const bot = new telegraf_1.Telegraf(env_1.default('BOT_ID'));
/** The username of the bot in that chat */
let username = '';
const defaultMaxTokens = 1000;
let maxTokens = defaultMaxTokens;
let tokens = [];
let lastRequest = Date.now();
bot.on('text', (ctx, next) => {
    const text = ctx.message.text;
    if (text.startsWith('/'))
        return next();
    const now = Date.now();
    if (now - lastRequest > 1000 * 60 * 60) {
        // more than an hour since last request
        tokens = [];
    }
    tokens.push(ctx.message.from.username + ': ' + text);
    openai
        .createCompletion({
        model: 'text-davinci-003',
        prompt: tokens.join('\n\n'),
        temperature: 0.3,
        max_tokens: maxTokens,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    })
        .then(response => {
        maxTokens = defaultMaxTokens;
        tokens.push(response.data.choices[0].text.trim());
        ctx.reply(response.data.choices[0].text);
    })
        .catch(err => {
        console.error(err);
    });
});
// bot.command('max_tokens', ctx => {
//     try {
//         const num = +ctx.message.text.split(/\s/)[1];
//         if (isNaN(num) || num < 1) throw Error('Stupid request');
//         maxTokens = num;
//         ctx.reply(
//             `Maximum number of tokens will be ${num} for the next request, and then, restaured to ${defaultMaxTokens}.`
//         );
//     } catch (err) {
//         ctx.reply('USAGE = "/max_tokens 500"');
//     }
// });
bot.launch();
bot.telegram.getMe().then(infos => {
    username = infos.username;
    console.log(`${infos.username} just started`);
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
