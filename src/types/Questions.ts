import {getWords} from "../utils";
import {Question} from "./Question";

class Questions {
    private answersMap: Map<string, string> = new Map();

    constructor(answers: Map<string, string>) {
        this.answersMap = answers;
    }

    get Size() {
        return this.answersMap.size;
    }

    async find(findSeq: string): Promise<Question | undefined> {
        const words = getWords(findSeq, {outputMode: "lowercase"});

        for (const [question, answer] of this.answersMap.entries()) {
            const loweredQuestion = question.toLowerCase();

            if (words.every(word => loweredQuestion.includes(word))) {
                return {question, answer} as Question;
            }
        }

        return undefined;
    }

    async findAll(findSeq: string): Promise<Array<Question>> {
        const words = getWords(findSeq, {outputMode: "lowercase"});
        const matches: Array<Question> = [];

        for (const [question, answer] of this.answersMap.entries()) {
            const loweredQuestion = question.toLowerCase();

            if (words.every(word => loweredQuestion.includes(word))) {
                matches.push({question, answer} as Question);
            }
        }

        return matches;
    }

    static Create(answers: Map<string, string>) {
        return new Questions(answers);
    }
}

export default Questions;