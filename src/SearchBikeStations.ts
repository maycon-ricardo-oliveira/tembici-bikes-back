import ApiGateway from "./ApiGateway";

export default class SearchBikeStations {

	constructor (
		readonly apiGateway: ApiGateway
 	) {

	}

	async execute(databaseId:string, sheetName:string, term: string) {
		
		try {

			const bikeStations = await this.apiGateway.searchBikeStations(databaseId, sheetName, term);

			const response = bikeStations.map((bikeStation: any) => {
				return {
					mech: bikeStation['Mecanica'],
					electric: bikeStation['Elétrica'],
					title: bikeStation['Estação'],
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
			console.error('Error searching bike stations:', error);
			throw new Error('Failed to search bike stations.');

		}
	}
}