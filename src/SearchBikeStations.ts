import NotionApiGateway from "./NotionApiGateway";

export default class SearchBikeStations {

	constructor(
		readonly notionApi: NotionApiGateway,
		readonly databaseId = 'f5574781ad2e4d5e85990658c3803c5c'
	) {

	}

	async execute(term: string)
	{
		const bikeStations = await this.notionApi.searchBikeStations(this.databaseId, term);

		return bikeStations;

	}
}