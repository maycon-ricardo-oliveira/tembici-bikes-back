import GetBikeStations from "./GetBikeStations";
import HttpServer from "./HttpServer";

export default class BikeStationsController {

	constructor (
		readonly httpServer: HttpServer, 
		getBikeStations: GetBikeStations

	) {
		httpServer.register("get", "/stations", async function (req: any, body: any) {

			const filters = [
				{
					name: "Bairro",
					value: req.query.neighborhood ?? null,
				},
				{
					name: "Plano",
					value: req.query.plan ?? null,
				},
				{
					name: "Dia da Semana",
					value: req.query.dayOfWeek ?? null,
				},
				{
					name: "Horário",
					value: req.query.time ?? null,
				},{
					name: "Cobrança Adicional",
					value: req.query.addCharge ?? null
				}
			];

			const response = await getBikeStations.execute(filters);
			return response;
		});
	}
}
