import { readFile } from 'fs/promises';
import path from 'path';

export async function loadSiteData(): Promise<any> {
  const raw = await readFile(path.join(process.cwd(), 'data', 'apartments.json'), 'utf-8');
  return JSON.parse(raw);
}
