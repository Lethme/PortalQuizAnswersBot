interface GetWordsOptions {
    outputMode?: "uppercase" | "lowercase"
}

export const getWords = (str: string, options?: GetWordsOptions): Array<string> => {
    const regex = /[\w\u0410-\u044F']+/g;
    const matches = str.match(regex);

    if (matches) {
        let matchesArray = matches.map((match) => match.toString());

        if (options) {
            if (options.outputMode) {
                matchesArray = matchesArray.map(match => {
                    if (options.outputMode === "uppercase") return match.toUpperCase();
                    if (options.outputMode === "lowercase") return match.toLowerCase();

                    return match;
                });
            }
        }

        return matchesArray;
    }

    return [];
}