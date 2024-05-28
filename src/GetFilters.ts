import ApiGateway from "./ApiGateway";

export default class GetFilters {

	constructor(
		readonly api: ApiGateway,
		readonly databaseId: string,
		readonly sheetName: string
	) {

	}

	async execute()
	{
		const filters = await this.api.getDatabaseFilters(this.databaseId, this.sheetName);

		return filters;

	}
}