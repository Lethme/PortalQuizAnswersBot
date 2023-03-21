import {Context, Markup, Telegraf} from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import Questions from "../types/Questions";
import session from 'telegraf-session-local';
import {BotContext} from "./types/BotContext";
import LaunchOptions = Telegraf.LaunchOptions;

class Bot {
    private static bot: Telegraf<Context<Update>>;
    private static questions: Questions;

    static get DevelopmentBuild(): boolean { return process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development'; }

    static Init(questions: Questions) {
        Bot.bot = new Telegraf(process.env.BOT_TOKEN || '');
        Bot.bot.use(new session({ database: "sessions.json" }));
        Bot.questions = questions;

        Bot.bot.start((ctx) => {
            const context: BotContext = ctx as any;
            context.reply('Welcome to my bot!');

            if (!context.session[ctx.chat.id]) {
                context.session[ctx.chat.id] = {};

                if (Bot.DevelopmentBuild) {
                    console.log(`Initialized session for chat: ${ctx.chat.id}`);
                }
            }
        });

        Bot.bot.help((ctx) => {
            const context: BotContext = ctx as BotContext;
            context.reply('This is a help message.');
        });

        Bot.bot.on('text', async (ctx) => {
            const context: BotContext = ctx as any;

            if (context.session[String(context.chat?.id)].messageId) {
                try {
                    await context.deleteMessage(Number(context.session[String(context.chat?.id)].messageId));
                } catch {}
            }

            const match = await Bot.questions.findAll(ctx.message.text);
            const matchIndex = 0;
            const request = ctx.message.text;
            context.session[String(context.chat?.id)].request = request;
            context.session[String(context.chat?.id)].responseIndex = matchIndex;
            context.session[String(context.chat?.id)].responseTotal = match.length;

            await context.deleteMessage();

            if (Bot.DevelopmentBuild) {
                console.log(`Found ${match.length} responses for chat: ${ctx.chat.id}`);
            }

            if (match) {
                const messageResponse = await context.replyWithHTML(
                    `<b><i>${request}</i></b>\n\n` +
                    `Номер ответа: ${matchIndex + 1}/${match.length}\n\n` +
                    `<b>Вопрос</b>: <code>${match[matchIndex].question?.replace(/[\\n]+/g, '\n')}</code>\n\n` +
                    `<b>Ответ</b>: <code>${match[matchIndex].answer?.replace(/[\\n]+/g, '\n')}</code>`,
                    match.length > 1 ? Bot.ResponseKeyboard : undefined
                );

                context.session[String(context.chat?.id)].messageId = messageResponse.message_id;
            } else {
                await context.reply("Вопроса по Вашему запросу не существует!");
            }
        });

        Bot.bot.action('show_prev', async (ctx) => {
            const context: BotContext = ctx as any;
            await Bot.SwitchResponseAction(context, "show_prev");
        });

        Bot.bot.action('show_next', async (ctx) => {
            const context: BotContext = ctx as any;
            await Bot.SwitchResponseAction(context, "show_next");
        });
    }

    static get ResponseKeyboard() {
        return Markup.inlineKeyboard([
            Markup.button.callback("Предыдущий", 'show_prev'),
            Markup.button.callback("Следующий", 'show_next'),
        ], {
            columns: 2,
        })
    }

    static async SwitchResponseAction(context: BotContext, action: "show_prev" | "show_next") {
        const request = context.session[String(context.chat?.id)].request;

        if (!request) {
            await context.reply("Пожалуйста, укажите новый запрос.");
        } else {
            if (context.session[String(context.chat?.id)].messageId) {
                try {
                    await context.deleteMessage(Number(context.session[String(context.chat?.id)].messageId));
                } catch {}
            }

            const match = await Bot.questions.findAll(request);
            let matchIndex = context.session[String(context.chat?.id)].responseIndex;

            if (!matchIndex) {
                matchIndex = 0;
            }

            if (action === "show_prev") {
                if (matchIndex === 0) {
                    matchIndex = match.length - 1;
                } else {
                    matchIndex--;
                }
            } else {
                if (matchIndex === match.length - 1) {
                    matchIndex = 0;
                } else {
                    matchIndex++;
                }
            }

            context.session[String(context.chat?.id)].responseTotal = match.length;
            context.session[String(context.chat?.id)].responseIndex = matchIndex;

            if (Bot.DevelopmentBuild) {
                console.log(`Found ${match.length} responses for chat: ${context.chat?.id} (Index: ${matchIndex})`);
            }

            const messageResponse = await context.replyWithHTML(
                `<b><i>${request}</i></b>\n\n` +
                `Номер ответа: ${matchIndex + 1}/${match.length}\n\n` +
                `<b>Вопрос</b>: <code>${match[matchIndex].question?.replace(/[\\n]+/g, '\n')}</code>\n\n` +
                `<b>Ответ</b>: <code>${match[matchIndex].answer?.replace(/[\\n]+/g, '\n')}</code>`,
                match.length > 1 ? Bot.ResponseKeyboard : undefined
            );

            context.session[String(context.chat?.id)].messageId = messageResponse.message_id;
        }
    }

    static async Launch(config?: LaunchOptions) {
        await Bot.bot.launch();
    }
}

export default Bot;