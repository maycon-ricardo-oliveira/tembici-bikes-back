import CacheFileManager from "./CacheFileManager";
import HttpServer from "./HttpServer";
import ResetCache from "./ResetCache";

export default class ResetCacheController {

	constructor(
		readonly httpServer: HttpServer, 
		readonly resetCache: ResetCache,
	) {
		httpServer.register("get", "/cache/:databaseId/:sheetName", async  (req: any, body: any) => {

			const sheetName = req.params.sheetName;
			const databaseId = req.params.databaseId;
			const response = await resetCache.execute(databaseId, sheetName);
			return response;
		});
	}

}