import fs from 'fs';
import path from 'path';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { chain } from 'stream-chain';

export default class CacheFileManager {

	async read(fileName: string): Promise<any> {
		const filePath = path.join(__dirname, fileName + '.json');
    const result: any[] = [];

    return new Promise((resolve, reject) => {
      const pipeline = chain([
        fs.createReadStream(filePath),
        parser(),
        streamArray()
      ]);

      pipeline.on('data', (data: any) => {
        result.push(data.value);
      });

      pipeline.on('end', () => {
        resolve(result);
      });

      pipeline.on('error', (error: any) => {
        console.error('Error reading cache file:', error);
        reject(error);
      });
    });
	}

	async write(fileName: string, data: any[]): Promise<void> {
    const filePath = path.join(__dirname, fileName + '.json');

    try {
      await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error: any) {
      console.error('Error writing cache file:', error);
    }
  }
}