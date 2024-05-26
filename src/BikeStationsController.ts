import GetBikeStations from "./GetBikeStations";
import { FilterCriteria } from "./GoogleSheetsApiAdapter";
import HttpServer from "./HttpServer";

export default class BikeStationsController {

	constructor (
		readonly httpServer: HttpServer, 
		getBikeStations: GetBikeStations

	) {
		httpServer.register("get", "/stations", async function (req: any, body: any) {

			const criteria: FilterCriteria = {
				'Mecanica': req.query.mech ?? null,
				'Elétrica': req.query.electric ?? null,
				'Endereço': req.query.address ?? null,
				'Cobrança Adicional': req.query.addCharge ?? null,
				'Tipo': req.query.type ?? null,
				'Dia da semana': req.query.dayOfWeek ?? null,
				'Horário': req.query.time ?? null,
				'Bairro': req.query.neighborhood ?? null,
				'Plano': req.query.plan ?? null,
				'Tarifa': req.query.tariff ?? null
			};
			

			console.log(criteria)
			const response = await getBikeStations.execute(criteria);
			return response;
		});
	}
}
