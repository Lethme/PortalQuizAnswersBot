import {Context, NarrowedContext} from "telegraf";

export interface BotSessionData {
    request?: string,
    responseTotal?: number;
    responseIndex?: number;
    messageId?: number | string;
}

export interface BotSession {
    [key: string]: BotSessionData
}

export interface BotContext extends Context {
    session: BotSession
}