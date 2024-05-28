import { FilterCriteria } from "./GoogleSheetsApiAdapter";
import ApiGateway from "./ApiGateway";

export default class GetBikeStations {

	constructor (
		readonly apiGateway: ApiGateway
	) {

	}

	async execute(databaseId:string, sheetName:string, criteria: FilterCriteria) {
		const response = await this.apiGateway.getBikeStations(databaseId, sheetName, criteria);
		return response;
	}

}