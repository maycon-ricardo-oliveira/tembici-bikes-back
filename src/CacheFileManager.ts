import fs from 'fs/promises';
import path from 'path';

export default class CacheFileManager {

	async read(fileName: string): Promise<any> {
		const filePath = path.join(__dirname, fileName+'.json');

		try {
			const data = await fs.readFile(filePath, 'utf8');
			return JSON.parse(data);
		} catch (error) {
			console.error('Error reading cache file:', error);
			return [];
		}
	}

	async write(fileName: string, data: any[]): Promise<void> {
		const filePath = path.join(__dirname, fileName+'.json');

		try {
			await fs.writeFile(filePath, JSON.stringify(data, null, 2));
		} catch (error) {
			console.error('Error writing cache file:', error);
		}
	}
}