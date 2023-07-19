import {writeFile} from 'fs/promises';

export async function writeFileAsync(path: string, data: string, encoding: string = 'utf-8', append: boolean = false): Promise<void> {
    const flags = append ? {flag: 'a'} : undefined;
    await writeFile(path, data, {encoding: encoding as any, ...flags});
}