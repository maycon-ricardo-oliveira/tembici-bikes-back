import { FilterCriteria } from "./GoogleSheetsApiAdapter";
import ApiGateway from "./ApiGateway";

export default class GetBikeStations {

	constructor (
		readonly apiGateway: ApiGateway
 ) {

	}

	async execute(databaseId:string, sheetName:string, criteria: FilterCriteria) {
		
		try {

			const bikeStations = await this.apiGateway.getBikeStations(databaseId, sheetName, criteria);
			


			const response = bikeStations.map((bikeStation: any) => {
				return {
					mech: bikeStation['Mecanica'],
					electric: bikeStation['Elétrica'],
					address: bikeStation['Endereço'],
					addCharge: bikeStation['Cobrança Adicional'],
					type: bikeStation['Tipo'],
					dayOfWeek: bikeStation['Dia da semana'],
					time: bikeStation['Horário'],
					neighborhood: bikeStation['Bairro'],
					city: bikeStation['Cidade'],
					plan: bikeStation['Plano'],
					tariff: bikeStation['Tarifa'],
					lat: bikeStation['Latitude'],
					lng: bikeStation['Longitude'],
				};

			})

			return response;

		} catch(error) {
			console.log(error);
			console.error('Error searching bike stations:', error);
			throw new Error('Failed to search bike stations.');

		}
		
		
	}

}