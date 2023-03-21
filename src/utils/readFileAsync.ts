import { readFile } from 'fs/promises';

export async function readFileAsync(path: string, encoding: string = 'utf-8'): Promise<string> {
    const data: string = (await readFile(path, { encoding: encoding as any })).toString();
    return data;
}