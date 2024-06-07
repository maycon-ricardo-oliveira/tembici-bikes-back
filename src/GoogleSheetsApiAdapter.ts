import { GoogleSpreadsheet } from "google-spreadsheet";
import Filter from "./Filter";
import {google} from 'googleapis';
import credentials from "../credentials.json";
import GoogleSheetFilter from "./Filters/GoogleSheetFilter";
import ApiGateway from "./ApiGateway";

import fs from 'fs/promises';
import { Location, Geocoder, GoogleMapsProvider } from '@goparrot/geocoder';
import axios from 'axios';
import CacheFileManager from "./CacheFileManager";
import { filter } from "cheerio/lib/api/traversing";

export interface FilterCriteria {
  [key: string]: any;
}

export default class GoogleSheetsApiAdapter implements ApiGateway {
	apiKey
	filters: Array<Filter> = [];
	service;
	batchSize = 400;
	geocoder: Geocoder;
	cache: CacheFileManager;
	config: CacheFileManager;
	constructor (cache: CacheFileManager, config: CacheFileManager) {
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
		this.config = config;
	}

	has12HoursPassed(lastExecution: string): boolean {
    const lastExecutionDate = new Date(lastExecution);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - lastExecutionDate.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    return hoursDifference >= 12;
	}

	calculateTariff(price: number) {
		if (price === 0) {
			return 'none';
		} else if (price > 0 && price <= 3) {
			return 'low';
		} else if (price > 3 && price <= 7) {
			return 'median';
		} else if (price > 7) {
			return 'high';
		} else {
			return 'invalid';
		}
	};

	getPriceByType(row: any, type: string): number {	
		if (type.toLowerCase() === 'mech') {
			return parseFloat(row['Mecanica']) || 0;
		} else if (type.toLowerCase() === 'electric') {
				return parseFloat(row['Elétrica']) || 0;
		}
		return 0;
	}

	getPriceByTypeOnObj(criteria: FilterCriteria, row: any): number {

		if (criteria['Tipo']) {
			if (criteria['Tipo'].toLowerCase() == 'mech') {
				return parseFloat(row['Mecanica']) || 0;
			}
			if (criteria['Tipo'].toLowerCase() == 'electric') {
				return parseFloat(row['Elétrica']) || 0;
			}
		}
		return 0;
	}

	matchesCriteria(row: any, criteria: FilterCriteria): boolean {
    
		for (const [key, value] of Object.entries(criteria)) {
			if (
				(value === null) || 
				(key === 'Tipo' && (value === 'mech' || value === 'electric'))
			) continue;

			if (key === 'Tarifa') {
				const type = criteria['Tipo'] || 'mech';
				const price = this.getPriceByType(row, type);
				const tariff = this.calculateTariff(price);
				if ((value === 'tariff' && price > 0) || (value === 'none' && price === 0)) {
					return true;
				}

				if (value !== null && value !== tariff) {
					return false;
				}
			}

			const cellValue = row[key];
			if (value !== cellValue) {
				return false;
			}
    }
    return true;
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

      const batchData = values.map((row, rowIndex) => {
        const obj: { [key: string]: any } = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      data = data.concat(batchData);
      startRow += this.batchSize;
    }

    const enhancedData = await Promise.all(data.map(async row => {

      let lat = Number(row['Latitude']) || null;
      let lng = Number(row['Longitude']) || null;

      if (!lat || !lng) {
        const location = await this.getLatLngFromAddress(row['Endereço']);
        lat = location.lat;
        lng = location.lng;
      }

      return {
        ...row,
        'Latitude': lat,
        'Longitude': lng
      };
    }));

    return enhancedData;
  }

  async getFilteredBikeStations(data: any[], criteria: FilterCriteria): Promise<any[]> {
		
		const filteredData = data.filter(row => {
			if (!this.matchesCriteria(row, criteria)) {
				return false;
			}
			const lat = Number(row['Latitude']) || null;
			const lng = Number(row['Longitude']) || null;
			return lat !== null && lng !== null;
		});

    const enhancedData = await Promise.all(filteredData.map(async row => {
      const price = this.getPriceByTypeOnObj(criteria, row);
      const tariff = this.calculateTariff(price);

      return {
        ...row,
        'Tipo': criteria['Tipo'],
        'Tarifa': tariff,
        'Latitude': Number(row['Latitude']),
        'Longitude': Number(row['Longitude'])
      };
    }));

    return enhancedData;
  }

  async getBikeStations(spreadsheetId: string, sheetName: string, criteria: FilterCriteria) {
    try {
      const config = await this.config.read();
      let cacheData = await this.cache.read();

			console.log(config)
			
      if (!cacheData || !config || !config.lastExecution || this.has12HoursPassed(config.lastExecution)) {
				cacheData = await this.fetchData(spreadsheetId, sheetName);
				await this.cache.write(cacheData);
				
				config.lastExecution = new Date().toISOString();
				// await this.config.write(config);
      }

      const filteredData = await this.getFilteredBikeStations(cacheData, criteria);
      return filteredData;

    } catch (error) {
      console.error('Error filtering sheet:', error);
    }
  }

	async searchBikeStations(databaseId: string, sheetName: string, term: string): Promise<any> {
		try {

			let cacheData = await this.cache.read();

			const filteredData = cacheData.filter((row:any) => {
				const station = row['Estação']?.toString().toLowerCase() || '';
				const address = row['Endereço']?.toString().toLowerCase() || '';
				const neighborhood = row['Bairro']?.toString().toLowerCase() || '';
				return station.includes(term.toLowerCase()) || address.includes(term.toLowerCase()) || neighborhood.includes(term.toLowerCase());
			});
	
			return filteredData;
		} catch (error) {
			console.error('Error searching bike stations:', error);
			throw new Error('Failed to search bike stations.');
		}

	}

	async updateSheetData(enhancedData: any[], headers:any[], spreadsheetId:string, sheetName:string) {
		const updatedValues = enhancedData.map(row => headers.map(header => row[header]));

			await this.service.spreadsheets.values.update({
				spreadsheetId,
				range: `${sheetName}!A2:${String.fromCharCode(65 + headers.length - 1)}${enhancedData.length + 1}`,
				valueInputOption: 'RAW',
				requestBody: {
					values: updatedValues,
				},
			});
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
	
	async getDatabaseFilters(spreadsheetId: string, sheetName: string): Promise<Array<Filter>> {

		const headerToQueryNameMap: { [key: string]: string } = {
			'Mecanica': 'mech',
			'Elétrica': 'electric',
			'Endereço': 'address',
			'Cobrança Adicional': 'addCharge',
			'Tipo': 'type',
			'Dia da Semana': 'dayOfWeek',
			'Horário': 'time',
			'Bairro': 'neighborhood',
			'Plano': 'plan',
			'Tarifa': 'tariff'
		};

		try {

			const headerResult = await this.service.spreadsheets.values.get({
				spreadsheetId,
				range: `${sheetName}!A1:Z1`,
			});
			
			const headers = headerResult.data.values ? headerResult.data.values[0] : [];
			if (headers.length === 0) {
				throw new Error('No headers found in the sheet.');
			}

			const filters = headers.map(header => {
				const queryName = headerToQueryNameMap[header] || header;
				return new GoogleSheetFilter(header, queryName, 'string');
			});

			return filters;
		} catch (error) {
			console.error('Error getting filters:', error);
			return [];
		}
	}
	
}