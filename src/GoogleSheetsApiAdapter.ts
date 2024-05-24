import { GoogleSpreadsheet } from "google-spreadsheet";
import Filter from "./Filter";
import AddChargeFilter from "./Filters/AddChargeFilter";
import NeighborhoodFilter from "./Filters/NeighborhoodFilter";
import PlanFilter from "./Filters/PlanFilter";
import TimeFilter from "./Filters/TimeFilter";
import WeekDayFilter from "./Filters/WeekDayFilter";
import NotionApiGateway from "./ApiGateway";
import { Client } from '@notionhq/client';
import {GoogleAuth} from 'google-auth-library';
import {google} from 'googleapis';
import { JWT } from "google-auth-library";
import credentials from "../credentials.json"
import GoogleSheetFilter from "./Filters/GoogleSheetFilter";
import ApiGateway from "./ApiGateway";
import { is } from "cheerio/lib/api/traversing";

export interface FilterCriteria {
  [key: string]: any;
}


export default class GoogleSheetsApiAdapter implements ApiGateway {
	apiKey
	filters: Array<Filter> = [];
	service
	sheetName = "São Paulo"
	batchSize = 500
	constructor () {
		this.apiKey = "AIzaSyCInglOulrm7ViPoBXW5N6E_lNKNIgVPS4"
		
		const auth = new google.auth.GoogleAuth({
			
			scopes: ["https://www.googleapis.com/auth/spreadsheets"],
			credentials: {
        client_email: credentials.client_id,
        private_key: credentials.private_key,
      },
		});

		this.service = google.sheets({version: 'v4', auth});
	}

	

	async getBikeStations(spreadsheetId: string, criteria: FilterCriteria) {
		try {
			let startRow = 1;
			let filteredData:any[] = [];
	
			const headerResult = await this.service.spreadsheets.values.get({
				spreadsheetId,
				range: `${this.sheetName}!A1:Z1`,
				valueRenderOption: 'UNFORMATTED_VALUE'
			});
			const headers = headerResult.data.values ? headerResult.data.values[0] : [];
			if (headers.length === 0) {
				throw new Error('No headers found in the sheet.');
			}
	
			const headerMap = new Map(headers.map((header, index) => [header, index]));
	
			const getPriceByType = (criteria: FilterCriteria) => {

				const isMech = criteria['Mecanica'];
				const isElectric = criteria['Elétrica'];

				if (isMech) {
					return isMech;
				}

				if (isElectric) {
					return isElectric;
				}
			};

			const matchesCriteria = (row: any[]) => {
				
				return Object.keys(criteria).every(key => {
					if (key === 'Tarifa') {
						const priceIndex = headerMap.get('Cobrança Adicional');	
						if (priceIndex !== undefined) {
							const price = parseFloat(row[priceIndex]);
							const tariff = this.calculateTariff(price);
							return criteria[key] === null || criteria[key] === tariff;
						}
						return true;
					}
			
					const colIndex = headerMap.get(key);
					if (criteria[key] === null) {
						return true;
					}
					return colIndex !== undefined && row[colIndex] === criteria[key];
				});
			};

			const getLatLngFromAddress = async () => {
				const places = bikeStations.results
				const place = places![0].properties;
		
				const address = place.Endereço.rich_text[0].plain_text;
		
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode( { 'address': address}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK)
					{
						console.log(results)
							// do something with the geocoded result
							//
							// results[0].geometry.location.latitude
							// results[0].geometry.location.longitude
					}
				});
			}
	
			while (true) {
				const endRow = startRow + this.batchSize - 1;
				const result = await this.service.spreadsheets.values.get({
					spreadsheetId,
					range: `${this.sheetName}!A${startRow}:Z${endRow}`,
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

			const enhancedData = filteredData.map(row => {
				
				const priceValue = getPriceByType(criteria);
				const price = !isNaN(parseFloat(priceValue)) && priceValue !== '' ? parseFloat(priceValue) : 0;
				const tariff = this.calculateTariff(price);
	
				return {
					...row,
					'Tarifa': tariff,
				};
			});

			return enhancedData;
		} catch (error) {
			console.error('Error filtering sheet:', error);
		}

	}

	async searchBikeStations(spreadsheetId: string, criteria: FilterCriteria): Promise<any> {

		try {
			let startRow = 1;
			let filteredData:any[] = [];
	
			const headerResult = await this.service.spreadsheets.values.get({
				spreadsheetId,
				range: `${this.sheetName}!A1:Z1`,
				valueRenderOption: 'UNFORMATTED_VALUE'
			});
			const headers = headerResult.data.values ? headerResult.data.values[0] : [];
			if (headers.length === 0) {
				throw new Error('No headers found in the sheet.');
			}
	
			const headerMap = new Map(headers.map((header, index) => [header, index]));
	
			const getPriceByType = (criteria: FilterCriteria) => {

				const isMech = criteria['Mecanica'];
				const isElectric = criteria['Elétrica'];

				if (isMech) {
					return isMech;
				}

				if (isElectric) {
					return isElectric;
				}
			};

			const matchesCriteria = (row: any[]) => {
				
				return Object.keys(criteria).every(key => {
					if (key === 'Tarifa') {
						const priceIndex = headerMap.get('Cobrança Adicional');	
						if (priceIndex !== undefined) {
							const price = parseFloat(row[priceIndex]);
							const tariff = this.calculateTariff(price);
							return criteria[key] === null || criteria[key] === tariff;
						}
						return true;
					}
			
					const colIndex = headerMap.get(key);
					if (criteria[key] === null) {
						return true;
					}
					return colIndex !== undefined && row[colIndex] === criteria[key];
				});
			};
	
			while (true) {
				const endRow = startRow + this.batchSize - 1;
				const result = await this.service.spreadsheets.values.get({
					spreadsheetId,
					range: `${this.sheetName}!A${startRow}:Z${endRow}`,
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

			const enhancedData = filteredData.map(row => {
				
				const priceValue = getPriceByType(criteria);
				const price = !isNaN(parseFloat(priceValue)) && priceValue !== '' ? parseFloat(priceValue) : 0;
				const tariff = this.calculateTariff(price);
	
				return {
					...row,
					'Tarifa': tariff,
				};
			});

			return enhancedData;
		} catch (error) {
			console.error('Error filtering sheet:', error);
		}

	}
	
	async getDatabaseFilters(spreadsheetId: string): Promise<Array<Filter>> {

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
				range: `${this.sheetName}!A1:Z1`,
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

  calculateTariff (price: number) {
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
	
}