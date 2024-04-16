import Filter from "./Filter";

export default interface NotionApiGateway {
	getPage(pageId: string): Promise<any>;
	getDatabaseFilters(databaseId: string): Promise<Array<Filter>>;
	queryDatabase(databaseId: string, filters: Array<any>): Promise<any>;
	searchBikeStations(databaseId: string, term: string): Promise<any>;

}
