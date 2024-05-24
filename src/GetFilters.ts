import ApiGateway from "./ApiGateway";

export default class GetFilters {

	constructor(
		readonly notionApi: ApiGateway,
		readonly databaseId: string
	) {

	}

	async execute()
	{
		const filters = await this.notionApi.getDatabaseFilters(this.databaseId);

		return filters;

	}
}