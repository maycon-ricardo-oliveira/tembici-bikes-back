import ApiGateway from "./ApiGateway";

export default class GetFilters {

	constructor(
		readonly api: ApiGateway
	) {

	}

	async execute(databaseId:string, sheetName:string)
	{
		const filters = await this.api.getDatabaseFilters(databaseId, sheetName);

		return filters;

	}
}