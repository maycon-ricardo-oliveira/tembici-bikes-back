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

			const output = await callback(req, req.body);
			res.json(output);
		});
	}

	async listen(port: number): Promise<void> {
		this.app.use(cors({
			origin: ['http://localhost:3000']
		}));
		return this.app.listen(port);
	}

}