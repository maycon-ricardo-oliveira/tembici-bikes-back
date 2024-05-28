import GetFilters from "./GetFilters";
import HttpServer from "./HttpServer";

export default class FiltersController {

	constructor (
		readonly httpServer: HttpServer, 
		getFilters: GetFilters

	) {
		httpServer.register("get", "/filters/:databaseId/:sheetName", async function (req: any, body: any) {

			const sheetName = req.params.sheetName;
			const databaseId = req.params.databaseId;
			const response = await getFilters.execute(databaseId, sheetName);
			return response;
		});
	}
}
