import {BotCommand} from "./types/BotCommand";
import {BotCommands} from "./types/BotCommands";

export const commands: Array<BotCommand> = [
	{command: BotCommands.Invite, description: "Create an invitational link for new user"},
	{command: BotCommands.Total, description: "Show total amount of questions loaded into the bot"}
];