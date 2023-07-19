import {Question} from "../types/Question";
import Questions from "../types/Questions";
import {isDevelopmentMode} from "./isDevelopmentMode";
import Logger from "./Logger";
import {readFileAsync} from "./readFileAsync";
import {trimSubstr} from "./trimSubstr";
import {useRawData} from "./useRawData";

export const getMdlQuestions = async () => {
	Logger.Log(`Reading data from file: ${process.env.MDL_DATA_FILE}`, "Reader");

	const data = await readFileAsync(process.env.MDL_DATA_FILE as string);
	// const regexGlobal = /\(([^,]+),\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^)]+)\)/g;
	// const regex = /\(([^,]+),\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*([^,]+),\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^)]+)\)/;
	const regexGlobal = /\('((?:\\.|[^'\\])+?)'\s*,\s*'((?:\\.|[^'\\])+?)'\)/g;
	const regex = /'((?:[^'\\]|\\.)+?)'/g;
	const regexInner = /'([^']*)'/g;

	Logger.Log("Searching for SQL inserts in raw data...", "Parser");

	const match = data.match(regexGlobal);

	let questionsMap: Map<string, string> = new Map();
	let questions: Questions = new Questions(questionsMap);

	Logger.LogLine("Parsing raw questions...", "Parser", true, "start");

	if (match) {
		for (const [index, insertMatch] of match.entries()) {
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

					if (isDevelopmentMode()) {
						if (index > 0) {
							process.stdout.write('\x1B[1A\x1B[0G');
						}

						Logger.Log(`${index + 1}/${match.length} (Unique questions found: ${questionsMap.size})`, "Parser", index === match.length - 1);
					}
				}
			}
		}

		const uniqueQuestions: { [key: string]: Question } = {};

		if (!useRawData()) {
			Logger.LogLine("Removing questions containing permutations...", "Parser", true, "start");
		}

		let index = 0;
		let uniqueQuestionsCount = 0;

		if (!useRawData()) {
			for (const [question, answer] of questionsMap.entries()) {
				const sortedQuestion = question.split("").sort().join("");

				if (isDevelopmentMode()) {
					if (index > 0) {
						process.stdout.write('\x1B[1A\x1B[0G');
					}

					Logger.Log(`${index++ + 1}/${questionsMap.size} (Unique questions found: ${uniqueQuestionsCount})`, "Parser", index === questionsMap.size);
				}

				if (!uniqueQuestions.hasOwnProperty(sortedQuestion)) {
					uniqueQuestions[sortedQuestion] = {
						question,
						answer
					}
					uniqueQuestionsCount++;
				}
			}
		}

		const resultQuestionsMap: Map<string, string> = new Map();

		if (!useRawData()) {
			for (const q of Object.values(uniqueQuestions)) {
				if (!resultQuestionsMap.has(q.question)) {
					resultQuestionsMap.set(q.question, q.answer);
				}
			}
		} else {
			for (const [question, answer] of questionsMap) {
				if (!resultQuestionsMap.has(question)) {
					resultQuestionsMap.set(question, answer);
				}
			}
		}

		Logger.Log(`Total questions found: ${resultQuestionsMap.size}\n`, "Parser");

		questions = Questions.Create(resultQuestionsMap);
	}

	return questions;
}