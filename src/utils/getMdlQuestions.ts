import {Question} from "../types/Question";
import Questions from "../types/Questions";
import {readFileAsync} from "./readFileAsync";
import {trimSubstr} from "./trimSubstr";

export const getMdlQuestions = async () => {
    const data = await readFileAsync(process.env.MDL_DATA_FILE as string);
    // const regexGlobal = /\(([^,]+),\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^)]+)\)/g;
    // const regex = /\(([^,]+),\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^)]+)\)/;
    const regexGlobal = /\('((?:\\.|[^'\\])+?)'\s*,\s*'((?:\\.|[^'\\])+?)'\)/g;
    const regex = /'((?:[^'\\]|\\.)+?)'/g;
    const regexInner = /'([^']*)'/g;
    const match = data.match(regexGlobal);

    let questionsMap: Map<string, string> = new Map();
    let questions: Questions = new Questions(questionsMap);

    if (match) {
        for (const insertMatch of match) {
            const quotedValuesMatch = insertMatch.match(regex);

            if (quotedValuesMatch) {
                const answerMatch = quotedValuesMatch.map(value => value.match(regexInner)!);
                const question: Question = {
                    question: answerMatch.at(Number(process.env.MDL_QUESTION_INDEX))?.at(0)!,
                    answer: answerMatch.at(Number(process.env.MDL_ANSWER_INDEX))?.at(0)!,
                }

                question.question = trimSubstr(question.question!, "'");
                question.answer = trimSubstr(question.answer!, "'");

                if (!questionsMap.has(question.question)) {
                    questionsMap.set(question.question, question.answer);
                }
            }
        }

        const uniqueQuestions: {[key: string]: Question} = {};

        for (const [question, answer] of questionsMap.entries()) {
            const sortedQuestion = question.split("").sort().join("");
            if (!uniqueQuestions.hasOwnProperty(sortedQuestion)) {
                uniqueQuestions[sortedQuestion] = {
                    question,
                    answer
                }
            }
        }

        const resultQuestionsMap: Map<string, string> = new Map();

        for (const q of Object.values(uniqueQuestions)) {
            if (!resultQuestionsMap.has(q.question)) {
                resultQuestionsMap.set(q.question, q.answer);
            }
        }

        questions = Questions.Create(resultQuestionsMap);
    }

    return questions;
}