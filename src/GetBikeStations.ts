import Filter from "./Filter";
import FilterOption from "./FilterOption";
import NotionApiGateway from "./ApiGateway";
import GoogleSheetsApiAdapter, { FilterCriteria } from "./GoogleSheetsApiAdapter";
import ApiGateway from "./ApiGateway";

export default class GetBikeStations {

	constructor (
		readonly apiGateway: ApiGateway,
		readonly databaseId: string
	) {

	}

	async execute(criteria: FilterCriteria) {
		const response = await this.apiGateway.getBikeStations(this.databaseId, criteria);
		return response;
	}

}