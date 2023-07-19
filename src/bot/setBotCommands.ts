import axios from "axios";
import {Logger} from "../utils";
import {commands} from "./commands";

export const setBotCommands = async () => {
	Logger.Log("Setting up bot commands...", "Bot");

	try {
		await axios.post(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/setMyCommands`, {commands});
		Logger.Log("Bot commands were successfully set up!", "Bot");
	} catch (error: any) {
		Logger.Log("An exception occurred on bot commands set up", "Bot");
		Logger.Log(error.message, "Bot");
	}
}