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

	async getCityFromLatLng(lat: number, lng: number): Promise<string | null> {
		try {
			const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
				params: {
					latlng: `${lat},${lng}`,
					key: this.apiKey
				}
			});
	
			const results = response.data.results;
			if (results.length > 0) {
				const addressComponents = results[0].address_components;
				const cityComponent = addressComponents.find((component: any) => 
					component.types.includes('locality') || component.types.includes('administrative_area_level_2')
				);
				return cityComponent ? cityComponent.long_name : null;
			}
			return null;
		} catch (error) {
			console.error('Error getting city from lat/lng:', error);
			return null;
		}
	}

	matchesCriteriaOld(row: any, criteria: FilterCriteria): boolean {

		console.log(criteria, row)
		for (const [key, value] of Object.entries(criteria)) {
			console.log(`Citeria key ${key} | Criteria value ${value} `)

			if (value !== null) {
				if (key === 'Tarifa') {
					const type = criteria['Tipo'] || 'mech';
					const price = this.getPriceByType(row, type);
					if ((value === 'tariff' && price > 0) || (value === 'none' && price === 0)) {
						return true;
					}
				}
	
				if (key === 'Cidade') {
					console.log(`Cidade criteria ${value} - Row ${row[key]}`)
				}
	
				const cellValue = row[key];
				if (value !== cellValue && key !== 'Tipo') {
					return false;
				}
	
			}
    }
    return true;
	}

	matchesCriteria(row: any, criteria: FilterCriteria): boolean {
		for (const key in criteria) {
			const value = criteria[key];
			const ignoreFiltersKey = ['Tipo', 'Latitude', 'Longitude'];

			if (value === null || ignoreFiltersKey.includes(key)) {
				continue;
			}
	
			if (key === 'Tarifa') {
				const type = criteria['Tipo'] || 'mech';
				const price = this.getPriceByType(row, type);

				if ((value === 'tariff' && price <= 0) || (value === 'none' && price !== 0)) {
					return false;
				}
			} else {
				const cellValue = row[key];
				if (value !== cellValue) {
					return false;
				}
			}
		}
		return true;
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
			const type = criteria['Tipo'] || 'mech';
			const price = this.getPriceByType(row, type);
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

			if (criteria['Latitude'] && criteria['Longitude']) {

				const lat = criteria['Latitude']
				const lng = criteria['Longitude'];

				const city = await this.getCityFromLatLng(lat, lng);
				if (city) {
					criteria['Cidade'] = city;
				}
			}

      let cacheData = await this.cache.read();
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
	
}