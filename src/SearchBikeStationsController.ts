import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import HttpServer from "./HttpServer";
import SearchBikeStations from "./SearchBikeStations";

export default class SearchBikeStationsController {

	constructor (
		readonly httpServer: HttpServer, 
		search: SearchBikeStations

	) {
		httpServer.register("get", "/search/", async function (req: any, body: any) {

			const response = await search.execute(req.params.term);
			return response;
		});
	}
}
