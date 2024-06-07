import Filter from "./Filter";
import {google} from 'googleapis';
import credentials from "../credentials.json";
import GoogleSheetFilter from "./Filters/GoogleSheetFilter";
import ApiGateway from "./ApiGateway";

import { Geocoder, GoogleMapsProvider } from '@goparrot/geocoder';
import axios from 'axios';
import CacheFileManager from "./CacheFileManager";

export interface FilterCriteria {
  [key: string]: any;
}

export default class ResetCache {

	apiKey
	filters: Array<Filter> = [];
	service;
	batchSize = 400;
	geocoder: Geocoder;
	cache: CacheFileManager;
	constructor (cache: CacheFileManager) {
		this.apiKey = process.env.GOOGLE_API_KEY ?? ''
		const auth = new google.auth.GoogleAuth({
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			credentials: {
        client_email: credentials.client_id,
        private_key: credentials.private_key,
      },
		});
		this.service = google.sheets({version: 'v4', auth, timeout: 10000});

		const provider: GoogleMapsProvider = new GoogleMapsProvider(axios, this.apiKey);
		this.geocoder = new Geocoder(provider);
		this.cache = cache;
	}
	
	async execute(spreadsheetId: string, sheetName: string) {

		const config = await this.cache.read('configs');
		let cacheData = await this.cache.read(sheetName);

		cacheData = await this.fetchData(spreadsheetId, sheetName);
		await this.cache.write(sheetName, cacheData);

		config.lastExecution = new Date();
		config.lastExecution.setDate(config.lastExecution.getDate()); // Definindo a data para dois dias atrás
		await this.cache.write('configs', config);
		
		return {
			lastExecution: config.lastExecution,
			cache: 'updated'
		};
	}

	has12HoursPassed(lastExecution: string): boolean {
    const lastExecutionDate = new Date(lastExecution);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - lastExecutionDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    return hoursDifference >= 12;
	}

	async fetchData(spreadsheetId: string, sheetName: string): Promise<any[]> {
		let startRow = 1;
		let data: any[] = [];
		const rowsToUpdate: any[] = [];
	
		const headerResult = await this.service.spreadsheets.values.get({
			spreadsheetId,
			range: `${sheetName}!A1:Z1`,
			valueRenderOption: 'UNFORMATTED_VALUE'
		});
	
		const headers = headerResult.data.values ? headerResult.data.values[0] : [];
		if (headers.length === 0) {
			throw new Error('No headers found in the sheet.');
		}
	
		const latIndex = headers.indexOf('Latitude');
		const lngIndex = headers.indexOf('Longitude');
	
		while (true) {
			const endRow = startRow + this.batchSize - 1;
			const result = await this.service.spreadsheets.values.get({
				spreadsheetId,
				range: `${sheetName}!A${startRow}:Z${endRow}`,
			});
	
			const values = result.data.values;
			if (!values || values.length === 0) {
				break;
			}
	
			const batchData = await Promise.all(values.map(async (row, rowIndex) => {
				if (startRow === 1 && rowIndex === 0) {
					return null;  // Skip header row
				}
	
				const obj: { [key: string]: any } = {};
				headers.forEach((header, index) => {
					obj[header] = row[index];
				});
	
				let lat = Number(obj['Latitude']) || null;
				let lng = Number(obj['Longitude']) || null;
	
				if (lat === null || lng === null) {
					const location = await this.getLatLngFromAddress(obj['Endereço']);
					lat = location.lat;
					lng = location.lng;
	
					obj['Latitude'] = lat;
					obj['Longitude'] = lng;
	
					rowsToUpdate.push({
						range: `${sheetName}!${this.getColumnLetter(latIndex + 1)}${startRow + rowIndex}`,
						values: [[lat]]
					});
					rowsToUpdate.push({
						range: `${sheetName}!${this.getColumnLetter(lngIndex + 1)}${startRow + rowIndex}`,
						values: [[lng]]
					});
				}
	
				return obj;
			}));
	
			data = data.concat(batchData.filter(row => row !== null));
			startRow += this.batchSize;
		}
	
		if (rowsToUpdate.length > 0) {
			await this.service.spreadsheets.values.batchUpdate({
				spreadsheetId,
				requestBody: {
					valueInputOption: 'RAW',
					data: rowsToUpdate
				}
			});
		}
	
		return data;
	}

	getColumnLetter(columnIndex: number): string {
		let temp = 0;
		let letter = '';
		while (columnIndex > 0) {
			temp = (columnIndex - 1) % 26;
			letter = String.fromCharCode(temp + 65) + letter;
			columnIndex = (columnIndex - temp - 1) / 26;
		}
		return letter;
	}

	async getLatLngFromAddress(address: string): Promise<{ lat: number|null, lng: number|null }> {
				
		const retries = 5;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

		for (let i = 0; i < retries; i++) {
      try {
        const [location] = await this.geocoder.geocode({ address });
        return {
          lat: location.latitude,
          lng: location.longitude
        };
      } catch (error) {
        console.error(`Error geocoding address: ${address}. Retrying...`);
        await delay(1000);
      }
    }

    console.error(`Failed to geocode address after ${retries} attempts: ${address}`);
    return { lat: 0, lng: 0 };
  }
}