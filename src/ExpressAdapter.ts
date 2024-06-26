import HttpServer from "./HttpServer";
import express from "express";
const cors = require('cors');
export default class ExpressAdapter implements HttpServer {
	app: any;

	constructor () {
		this.app = express();
	}

	async register(method: string, url: string, callback: Function): Promise<void> {
		this.app[method](url, async function (req: any, res: any) {
			res.setHeader( "Access-Control-Allow-Origin", "*" );
			res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
			res.setHeader("Access-Control-Allow-Methods", "GET, POST")

			const output = await callback(req, req.body);
			res.json(output);
		});
	}

	async listen(port: number): Promise<void> {
		this.app.use(cors());
		return this.app.listen(port);
	}

}