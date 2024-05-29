import GetBikeStations from "./GetBikeStations";
import { FilterCriteria } from "./GoogleSheetsApiAdapter";
import HttpServer from "./HttpServer";

export default class SearchBikeStationsController {

	constructor (
		readonly httpServer: HttpServer, 
		getBikeStations: GetBikeStations

	) {
		httpServer.register("get", "/stations/:databaseId/:sheetName/search/:term", async function (req: any, body: any) {

			const sheetName = req.params.sheetName;
			const databaseId = req.params.databaseId;
			const term = req.params.term;
			const response = await getBikeStations.execute(databaseId, sheetName, term);
			return response;
		});
	}
}
