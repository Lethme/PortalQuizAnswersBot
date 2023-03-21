export function trimSubstr(str: string, substr: string): string {
    const startIndex = str.indexOf(substr);
    const endIndex = str.lastIndexOf(substr) + substr.length;

    if (startIndex === -1 || endIndex <= startIndex) {
        return str;
    }

    return str.slice(startIndex + substr.length, endIndex - substr.length);
};