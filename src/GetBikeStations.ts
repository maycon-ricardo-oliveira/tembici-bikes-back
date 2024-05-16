import Filter from "./Filter";
import FilterOption from "./FilterOption";
import NotionApiGateway from "./NotionApiGateway";

export default class GetBikeStations {

	constructor (
		readonly notionApi: NotionApiGateway,
		readonly databaseId = 'f5574781ad2e4d5e85990658c3803c5c'
	) {

	}

	async execute(usingFilters: Array<any>) {
		const filters = await this.notionApi.getDatabaseFilters(this.databaseId);

		var sendFilters:Array<any> = [];

		usingFilters.map((option: any) => {
			filters.map((filter: Filter) => {
				if (filter.name == option.name) {
					sendFilters.push(filter.setFilter(option.value))
				}
			})
		})

		const response = await this.notionApi.queryDatabase(this.databaseId, sendFilters);

		console.log(response.results
		);
		return response;

	}

}