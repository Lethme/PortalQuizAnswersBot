import {BotCommands} from "./BotCommands";

export interface BotCommand {
	command: BotCommands;
	description?: string;
}