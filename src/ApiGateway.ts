import { FilterCriteria } from "./GoogleSheetsApiAdapter";

export default interface ApiGateway {
	getBikeStations(databaseId: string, sheetName: string, criteria: FilterCriteria): Promise<any>;
	searchBikeStations(databaseId: string, sheetName: string, term: string): Promise<any>;
}
