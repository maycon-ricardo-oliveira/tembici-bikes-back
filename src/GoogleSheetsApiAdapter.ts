import { GoogleSpreadsheet } from "google-spreadsheet";
import Filter from "./Filter";
import {google} from 'googleapis';
import credentials from "../credentials.json";
import GoogleSheetFilter from "./Filters/GoogleSheetFilter";
import ApiGateway from "./ApiGateway";

import 'reflect-metadata';
import { Location, Geocoder, GoogleMapsProvider } from '@goparrot/geocoder';
import axios from 'axios';

export interface FilterCriteria {
  [key: string]: any;
}

export default class GoogleSheetsApiAdapter implements ApiGateway {
	apiKey
	filters: Array<Filter> = [];
	service
	batchSize = 400
	geocoder
	constructor () {
		this.apiKey = process.env.GOOGLE_API_KEY ?? ''
		const auth = new google.auth.GoogleAuth({
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			credentials: {
        client_email: credentials.client_id,
        private_key: credentials.private_key,
      },
		});
		this.service = google.sheets({version: 'v4', auth});

		const provider: GoogleMapsProvider = new GoogleMapsProvider(axios, this.apiKey);
		this.geocoder = new Geocoder(provider);
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

	getPriceByType(row: any[], headerMap: Map<string, number>, type: string): number {
    console.log(row, headerMap, type)
	
		
		if (type.toLowerCase() === 'mech') {
        const mechIndex = headerMap.get('Mecanica');
        if (mechIndex !== undefined) {
          return parseFloat(row[mechIndex]) || 0;
        }
    } else if (type.toLowerCase() === 'electric') {
        const elecIndex = headerMap.get('Elétrica');
        if (elecIndex !== undefined) {
          return parseFloat(row[elecIndex]) || 0;
        }
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

	async getBikeStations(spreadsheetId: string, sheetName: string, criteria: FilterCriteria) {
		try {
			let startRow = 1;
			let filteredData:any[] = [];
	
			const headerResult = await this.service.spreadsheets.values.get({
				spreadsheetId,
				range: `${sheetName}!A1:Z1`,
				valueRenderOption: 'UNFORMATTED_VALUE'
			});

			const headers = headerResult.data.values ? headerResult.data.values[0] : [];
			if (headers.length === 0) {
				throw new Error('No headers found in the sheet.');
			}
	
			const headerMap = new Map(headers.map((header, index) => [header, index]));

			let latIndex = headers.indexOf('Latitude');
      let lngIndex = headers.indexOf('Longitude');

      if (latIndex === -1) {
        headers.push('Latitude');
        latIndex = headers.length - 1;
      }
      if (lngIndex === -1) {
        headers.push('Longitude');
        lngIndex = headers.length - 1;
      }

			const matchesCriteria = (row: any[]) => {
				for (const [key, value] of Object.entries(criteria)) {
						if (key === 'Tarifa') {
							const type = criteria['Tipo'] || 'mech';
							const price = this.getPriceByType(row, headerMap, type);

							if (value === 'tariff' && price > 0) {
                return true;
							}

							if (value === 'none' && price === 0) {
								return true;
            	}

							const tariff = this.calculateTariff(price);

							if (value !== null && value !== tariff) {
									return false;
							}
						} else if (key === 'Tipo' && (value === 'mecanica' || value === 'eletrica')) {
								continue;
						} else {
								const colIndex = headerMap.get(key);
								if (colIndex !== undefined) {
										const cellValue = row[colIndex];
										if (value !== null && value !== cellValue) {
												return false;
										}
								}
						}
				}
				return true;
		};
		
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
	
				const filteredBatch = values.filter((row, rowIndex) => {
					if (startRow === 1 && rowIndex === 0) {
						return false;
					}
					return matchesCriteria(row);
				}).map(row => {
          const obj: { [key: string]: any } = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
	
				filteredData = filteredData.concat(filteredBatch);
				startRow += this.batchSize;
			}

			const enhancedData =  await Promise.all(filteredData.map(async row => {
				const price = this.getPriceByTypeOnObj(criteria, row);
				const tariff = this.calculateTariff(price);

				console.log(price, tariff)

				let lat = Number(row['Latitude']) || null;
				let lng = Number(row['Longitude']) || null;

				if (!lat || !lng) {
          const location = await this.getLatLngFromAddress(row['Endereço']);
          lat = location.lat;
          lng = location.lng;
        }

				return {
					...row,
					'Tipo': criteria['Tipo'],
					'Tarifa': tariff,
					'Latitude': lat,
					'Longitude': lng
				};
			}));

			await this.updateSheetData(enhancedData, headers, spreadsheetId, sheetName);
			return enhancedData;
		} catch (error) {
			console.error('Error filtering sheet:', error);
		}

	}

	async searchBikeStations(databaseId: string, sheetName: string, term: string): Promise<any> {
			try {
				let startRow = 1;
				let filteredData: any[] = [];
	
				const headerResult = await this.service.spreadsheets.values.get({
					spreadsheetId: databaseId,
					range: `${sheetName}!A1:Z1`,
					valueRenderOption: 'UNFORMATTED_VALUE'
				});
	
				const headers = headerResult.data.values ? headerResult.data.values[0] : [];
				if (headers.length === 0) {
					throw new Error('No headers found in the sheet.');
				}
	
				const headerMap = new Map(headers.map((header, index) => [header, index]));
	
				while (true) {
					const endRow = startRow + this.batchSize - 1;
					const result = await this.service.spreadsheets.values.get({
						spreadsheetId: databaseId,
						range: `${sheetName}!A${startRow}:Z${endRow}`,
					});
	
					const values = result.data.values;
					if (!values || values.length === 0) {
						break;
					}
	
					const filteredBatch = values.filter((row, rowIndex) => {
						if (startRow === 1 && rowIndex === 0) {
							return false;
						}
						const stationIndex = headerMap.get('Estação');
						const addressIndex = headerMap.get('Endereço');
						const stationValue = stationIndex !== undefined ? row[stationIndex] : '';
						const addressValue = addressIndex !== undefined ? row[addressIndex] : '';
	
						return (
							stationValue.toString().toLowerCase().includes(term.toLowerCase()) ||
							addressValue.toString().toLowerCase().includes(term.toLowerCase())
						);
					}).map(row => {
						const obj: { [key: string]: any } = {};
						headers.forEach((header, index) => {
							obj[header] = row[index];
						});
						return obj;
					});
	
					filteredData = filteredData.concat(filteredBatch);
					startRow += this.batchSize;
				}
	
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
				
		try {
			const locations: Location[] = await this.geocoder.geocode({
					address: address,
			});
		
			if (!locations || locations.length === 0) {
        return { lat: null, lng: null };
      }
			
			return {
				lat: locations[0]?.latitude ?? null,
				lng: locations[0]?.longitude ?? null,
			};
		
		} catch (err) {
			console.error(err);
			return { lat: null, lng: null };
		}
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