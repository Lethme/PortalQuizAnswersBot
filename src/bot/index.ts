import {escape} from "html-escaper";
import {Context, Markup, Telegraf} from 'telegraf';
import session from 'telegraf-session-local';
import {Update} from 'telegraf/typings/core/types/typegram';
import Access, {AccessRole} from "../types/Access";
import Questions from "../types/Questions";
import {getWords, Logger} from "../utils";
import {setBotCommands} from "./setBotCommands";
import {BotCommands} from "./types/BotCommands";
import {BotContext} from "./types/BotContext";
import LaunchOptions = Telegraf.LaunchOptions;

class Bot {
	private static bot: Telegraf<Context<Update>>;
	private static questions: Questions;

	static get DevelopmentBuild(): boolean {
		return process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development';
	}

	static async Init(questions: Questions) {
		await setBotCommands();

		Logger.Log("Initializing Telegram Bot...", "Bot");

		Bot.bot = new Telegraf(process.env.BOT_TOKEN || '');
		Bot.bot.use(new session({database: "sessions.json"}));
		Bot.questions = questions;

		const botUsername = (await Bot.bot.telegram.getMe()).username;
		await Access.Init(botUsername);

		Bot.bot.start(async (ctx) => {
			const context: BotContext = ctx as any;
			await ctx.deleteMessage();

			const userAccess = Access.GetUserAccessRole(ctx.from.id);
			const commandParams = ctx.message.text.split(" ").filter(param => param).slice(1);

			if (userAccess !== AccessRole.Unknown) {
				await ctx.reply(ctx.from.language_code && ctx.from.language_code === 'ru' ? `У Вас уже есть доступ к функционалу бота.` : `You already have access to bot functions.`);
				Logger.Log(`${ctx.from.username} (${ctx.from.id}): Tried to follow invite link but was already registered`, "Bot");
				return;
			}

			if (commandParams.length !== 1) {
				await ctx.reply(ctx.from.language_code && ctx.from.language_code === 'ru' ? `Для получения доступа к функционалу бота необходимо получить приглашение.` : `You have to be invited in order to get the access to bot functions.`);
				Logger.Log(`${ctx.from.username} (${ctx.from.id}): Tried to use /start command without params`, "Bot");
				return;
			}

			if (!Access.CheckPassword(commandParams[0])) {
				await ctx.reply(ctx.from.language_code && ctx.from.language_code === 'ru' ? `Данное приглашение уже недействительно.\nОбратитесь к администратору для получения новой ссылки.` : `An invitation was invalid.\nYou need to ask administrator for a new one.`);
				Logger.Log(`${ctx.from.username} (${ctx.from.id}): Tried to use outdated invite link`, "Bot");
				return;
			} else {
				await Access.AddUser(ctx.from.id);
				await Access.ChangePassword();

				await ctx.reply(
					ctx.from.language_code && ctx.from.language_code === 'ru'
						? 'Добро пожаловать!\n\nДля поиска вопросов на <a href="http://portal.volpi.ru/">Портале</a> напиши мне какое-нибудь сообщение.'
						: 'Welcome!\n\nType me any message to search the questions on <a href="http://portal.volpi.ru/">Портале</a>.'
				);

				Logger.Log(`${ctx.from.username} (${ctx.from.id}): Access granted. Registered as User`, "Bot");

				if (!context.session[ctx.chat.id]) {
					context.session[ctx.chat.id] = {};

					Logger.Log(`Initialized session for chat: ${ctx.from.username} (${ctx.chat.id})`, "Bot");
				}
			}
		});

		Bot.bot.command(BotCommands.Invite, async (ctx) => {
			if (!Access.HasAccess(ctx.from.id)) {
				await ctx.deleteMessage();
				await ctx.reply(
					ctx.from.language_code && ctx.from.language_code === 'ru'
						? `У Вас нет доступа к функционалу бота.\nДля получения доступа необходимо получить приглашение.`
						: `You have no access to bot functions.\nTo get the access you have to be invited.`
				);
				return;
			}

			const context: BotContext = ctx as any;
			const userAccess = Access.GetUserAccessRole(ctx.from.id);

			if (userAccess === AccessRole.Root) {
				await ctx.deleteMessage();
				await ctx.replyWithHTML(`<a href="${Access.InviteLink}">${ctx.from.language_code && ctx.from.language_code === 'ru' ? "Приглашение" : "Invitation"}</a>`);

				Logger.Log(`${ctx.from.username} (${ctx.chat.id}): Created invite link`, "Bot");
			}
		});

		Bot.bot.command(BotCommands.Total, async (ctx) => {
			await ctx.deleteMessage();
			await ctx.reply(
				ctx.from.language_code && ctx.from.language_code === 'ru'
					? `Текущее количество вопросов бота: ${questions.Size}`
					: `Current amount of bot's questions: ${questions.Size}`
			);

			Logger.Log(`${ctx.from.username} (${ctx.chat.id}): Requested a total amount of questions`, "Bot");
		});

		Bot.bot.on('text', async (ctx) => {
			if (!Access.HasAccess(ctx.from.id)) {
				await ctx.deleteMessage();
				await ctx.reply(
					ctx.from.language_code && ctx.from.language_code === 'ru'
						? `У Вас нет доступа к функционалу бота.\nДля получения доступа необходимо получить приглашение.`
						: `You have no access to bot functions.\nTo get the access you have to be invited.`
				);
				return;
			}

			const context: BotContext = ctx as any;
			const ruLang = context.from?.language_code && context.from?.language_code === 'ru';

			if (context.session[String(context.chat?.id)].messageId) {
				try {
					await context.deleteMessage(Number(context.session[String(context.chat?.id)].messageId));
				} catch {
				}
			}

			const match = await Bot.questions.findAll(ctx.message.text);
			const matchIndex = 0;
			const request = getWords(ctx.message.text).join(" ");
			context.session[String(context.chat?.id)].request = request;
			context.session[String(context.chat?.id)].responseIndex = matchIndex;
			context.session[String(context.chat?.id)].responseTotal = match.length;

			await context.deleteMessage();

			Logger.Log(`${ctx.from.username} (${ctx.chat.id}): Requested '${request}' | Found ${match.length} questions`, "Bot");

			if (match && match.length) {
				const messageResponse = await context.replyWithHTML(
					`<b><i>${request}</i></b>\n\n` +
					`${ruLang ? "Номер ответа" : "Answer Index"}: ${matchIndex + 1}/${match.length}\n\n` +
					`<b>${ruLang ? "Вопрос" : "Question"}</b>: <code>${escape(match[matchIndex].question?.replace(/[\\n]+/g, '\n'))}</code>\n\n` +
					`<b>${ruLang ? "Ответ" : "Answer"}</b>: <code>${escape(match[matchIndex].answer?.replace(/[\\n]+/g, '\n'))}</code>`,
					match.length > 1 ? Bot.ResponseKeyboard(ctx as BotContext) : undefined
				);

				context.session[String(context.chat?.id)].messageId = messageResponse.message_id;
			} else {
				await context.replyWithHTML(`${ruLang ? "Я не смог найти вопрос по Вашему запросу" : "I couldn't find the question by your request"}: <b><i>${request}</i></b>`);
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

	static ResponseKeyboard(ctx: BotContext) {
		return Markup.inlineKeyboard([
			Markup.button.callback(ctx.from?.language_code && ctx.from?.language_code === 'ru' ? "Предыдущий" : "Previous", 'show_prev'),
			Markup.button.callback(ctx.from?.language_code && ctx.from?.language_code === 'ru' ? "Следующий" : "Next", 'show_next'),
		], {
			columns: 2,
		})
	}

	static async SwitchResponseAction(context: BotContext, action: "show_prev" | "show_next") {
		if (!Access.HasAccess(context.from?.id!)) {
			await context.deleteMessage();
			await context.reply(
				context.from?.language_code && context.from?.language_code === 'ru'
					? `У Вас нет доступа к функционалу бота.\nДля получения доступа необходимо получить приглашение.`
					: `You have no access to bot functions.\nTo get the access you have to be invited.`
			);
			return;
		}

		const request = context.session[String(context.chat?.id)].request;
		const ruLang = context.from?.language_code && context.from?.language_code === 'ru';

		if (!request) {
			await context.reply(
				context.from?.language_code && context.from?.language_code === 'ru'
					? `"Пожалуйста, укажите новый запрос."`
					: `Please type a new request.`
			);
		} else {
			if (context.session[String(context.chat?.id)].messageId) {
				try {
					await context.deleteMessage(Number(context.session[String(context.chat?.id)].messageId));
				} catch {
				}
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

			Logger.Log(`${context.from?.username} (${context.chat?.id}): Requested '${request}' | Found ${match.length} questions (Index: ${matchIndex})`, "Bot");

			if (match && match.length) {
				const messageResponse = await context.replyWithHTML(
					`<b><i>${request}</i></b>\n\n` +
					`${ruLang ? 'Номер ответа' : "Answer Index"}: ${matchIndex + 1}/${match.length}\n\n` +
					`<b>${ruLang ? 'Вопрос' : 'Question'}</b>: <code>${escape(match[matchIndex].question?.replace(/[\\n]+/g, '\n'))}</code>\n\n` +
					`<b>${ruLang ? "Ответ" : "Answer"}</b>: <code>${escape(match[matchIndex].answer?.replace(/[\\n]+/g, '\n'))}</code>`,
					match.length > 1 ? Bot.ResponseKeyboard(context) : undefined
				);

				context.session[String(context.chat?.id)].messageId = messageResponse.message_id;
			}
		}
	}

	static async Launch(config?: LaunchOptions) {
		Logger.LogLine("Starting Bot...", "Bot", true, "end");
		await Bot.bot.launch();
	}
}

export default Bot;