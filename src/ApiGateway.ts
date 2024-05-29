import Filter from "./Filter";
import { FilterCriteria } from "./GoogleSheetsApiAdapter";

export default interface ApiGateway {
	getDatabaseFilters(databaseId: string, sheetName: string): Promise<Array<Filter>>;
	getBikeStations(databaseId: string, sheetName: string, criteria: FilterCriteria): Promise<any>;
	searchBikeStations(databaseId: string, sheetName: string, term: string): Promise<any>;
}
