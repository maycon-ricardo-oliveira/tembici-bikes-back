import NotionApiGateway from "./NotionApiGateway";

export default class GetFilters {

	constructor(
		readonly notionApi: NotionApiGateway,
		readonly databaseId = 'f5574781ad2e4d5e85990658c3803c5c'
	) {

	}

	async execute()
	{
		const filters = await this.notionApi.getDatabaseFilters(this.databaseId);

		return filters;

	}
}