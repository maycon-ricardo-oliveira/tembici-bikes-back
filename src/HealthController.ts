import HttpServer from "./HttpServer";

export default class HealthController {

	constructor (
		readonly httpServer: HttpServer, 
	) {
		httpServer.register("get", "/health", async function (req: any, body: any) {
			return { status: 'OK' }
		});
	}
}
