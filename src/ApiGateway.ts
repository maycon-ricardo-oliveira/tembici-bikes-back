import Filter from "./Filter";
import { FilterCriteria } from "./GoogleSheetsApiAdapter";

export default interface ApiGateway {
	getDatabaseFilters(databaseId: string): Promise<Array<Filter>>;
	getBikeStations(databaseId: string, criteria: FilterCriteria): Promise<any>;
}
