import {getFormattedDateNow} from "./getFormattedDate";
import {isDevelopmentMode} from "./isDevelopmentMode";

class Logger {
    static Log(message: string, moduleName: string = "Logger", showDate: boolean = true) {
        Logger.LogLine(message, moduleName, showDate, "none");
    }

    static LogLine(message: string, moduleName: string = "Logger", showDate: boolean = true, newLine: "start" | "end" | "both" | "none" = "none") {
        if (isDevelopmentMode()) {
            console.log(
                `${newLine === "start" || newLine === "both" ? "\n" : ''}` +
                `[${moduleName}${showDate ? ` - ${getFormattedDateNow()}` : ''}] ${message}` +
                `${newLine === "end" || newLine === "both" ? "\n" : ''}`
            );
        }
    }
}

export default Logger;