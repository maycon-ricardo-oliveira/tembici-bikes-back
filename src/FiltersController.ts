import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import HttpServer from "./HttpServer";

export default class FiltersController {

	constructor (
		readonly httpServer: HttpServer, 
		getFilters: GetFilters

	) {
		httpServer.register("get", "/filters", async function (req: any, body: any) {

			const response = await getFilters.execute();
			return response;
		});
	}
}
