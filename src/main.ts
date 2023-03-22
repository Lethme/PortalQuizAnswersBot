import {config} from 'dotenv';
import Bot from "./bot";
import {getMdlQuestions} from "./utils";

config({
    path: process.env.NODE_ENV ? `.${process.env.NODE_ENV}.env` : '.env'
});

const bootstrap = async () => {
    await Bot.Init(await getMdlQuestions());
    await Bot.Launch();
}

bootstrap();