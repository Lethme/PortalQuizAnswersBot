import { config } from 'dotenv';
import Bot from "./bot";
import { getMdlQuestions } from "./utils/getMdlQuestions";

config({
    path: process.env.NODE_ENV ? `.${process.env.NODE_ENV}.env` : '.env'
});

const bootstrap = async () => {
    Bot.Init(await getMdlQuestions());
    await Bot.Launch();
}

bootstrap();