import {Question} from "./Question";

class Questions {
    private answersMap: Map<string, string> = new Map();

    constructor(answers: Map<string, string>) {
        this.answersMap = answers;
    }

    async find(findSeq: string): Promise<Question | undefined> {
        for (const [key, value] of this.answersMap.entries()) {
            if (key.toLowerCase().includes(findSeq.toLowerCase())) {
                return { question: key, answer: value };
            }
        }

        return undefined;
    }

    async findAll(findSeq: string): Promise<Array<Question>> {
        const matches: Array<Question> = [];

        for (const [key, value] of this.answersMap.entries()) {
            if (key.toLowerCase().includes(findSeq.toLowerCase())) {
                matches.push({ question: key, answer: value });
            }
        }

        return matches;
    }

    static Create(answers: Map<string, string>) {
        return new Questions(answers);
    }
}

export default Questions;