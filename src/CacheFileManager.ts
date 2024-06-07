import fs from 'fs/promises';

export default class CacheFileManager {
	filePath: string;

	constructor(filePath: string) {
		this.filePath = filePath;
	}

	async read(): Promise<any> {
		try {
			const data = await fs.readFile(this.filePath, 'utf8');
			return JSON.parse(data);
		} catch (error) {
			console.error('Error reading cache file:', error);
			return [];
		}
	}

	async write(data: any[]): Promise<void> {
		try {
			await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
		} catch (error) {
			console.error('Error writing cache file:', error);
		}
	}
}