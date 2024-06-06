import HttpServer from "./HttpServer";
import SearchBikeStations from "./SearchBikeStations";

export default class SearchBikeStationsController {

	constructor (
		readonly httpServer: HttpServer, 
		searchBikeStations: SearchBikeStations

	) {
		httpServer.register("get", "/stations/:databaseId/:sheetName/search/:term", async function (req: any, body: any) {

			const sheetName = req.params.sheetName;
			const databaseId = req.params.databaseId;
			const term = req.params.term;
			const response = await searchBikeStations.execute(databaseId, sheetName, term);
			return response;
		});
	}
}
