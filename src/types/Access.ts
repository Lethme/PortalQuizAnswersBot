import {Logger, readFileAsync, writeFileAsync} from "../utils";

interface AccessData {
    password: string;
    root: Array<string>;
    users: Array<string>;
}

export enum AccessRole {
    Root,
    User,
    Unknown,
}

class Access {
    private static get PasswordCharacters() {
        return process.env.ACCESS_PASSWORD_CHARS!
    };

    private static get PasswordLength() {
        return Number(process.env.ACCESS_PASSWORD_LENGTH!)
    };

    private static AccessData?: AccessData;
    private static BotUsername: string;

    private static GeneratePassword(): string {
        let password = "";
        for (let i = 0; i < Access.PasswordLength; i++) {
            const randomIndex = Math.floor(Math.random() * Access.PasswordCharacters.length);
            password += Access.PasswordCharacters[randomIndex];
        }
        return password;
    }

    private static async Load(): Promise<AccessData | undefined> {
        try {
            const rawData = await readFileAsync(process.env.ACCESS_DATA_FILE!);
            const data: AccessData = JSON.parse(rawData);

            return data;
        } catch (e: any) {
            Logger.Log(e.message, "Exception");

            Access.AccessData = {
                password: Access.GeneratePassword(),
                root: [
                    process.env.ACCESS_INITIAL_ROOT as string,
                ],
                users: []
            };

            await Access.Save();

            return undefined;
        }
    }

    private static async Save() {
        try {
            await writeFileAsync(process.env.ACCESS_DATA_FILE!, JSON.stringify(Access.AccessData, null, 4));
        } catch (e: any) {
            Logger.Log(e.message, "Exception");
        }
    }

    static get InviteLink(): string {
        return `https://t.me/${Access.BotUsername}?start=${Access.AccessData?.password}`;
    }

    static CheckPassword(password: string): boolean {
        return Access.AccessData?.password === password;
    }

    static HasAccess(telegramId: number | string): boolean {
        const userAccess = Access.GetUserAccessRole(telegramId);
        return userAccess !== AccessRole.Unknown;
    }

    static GetUserAccessRole(telegramId: number | string): AccessRole {
        if (Access.AccessData?.root.some(id => id === String(telegramId))) {
            return AccessRole.Root;
        }

        if (Access.AccessData?.users.some(id => id === String(telegramId))) {
            return AccessRole.User;
        }

        return AccessRole.Unknown
    }

    static async AddRoot(telegramId: number | string) {
        Access.AccessData?.root.push(String(telegramId));
        await Access.Save();
    }

    static async AddUser(telegramId: number | string) {
        Access.AccessData?.users.push(String(telegramId));
        await Access.Save();
    }

    static async ChangePassword() {
        Access.AccessData!.password = Access.GeneratePassword();
        await Access.Save();
    }

    static async Init(botUsername: string) {
        Access.AccessData = await Access.Load();
        Access.BotUsername = botUsername;
    }
}

export default Access;