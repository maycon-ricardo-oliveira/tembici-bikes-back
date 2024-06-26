import Filter from "./Filter";
import AddChargeFilter from "./Filters/AddChargeFilter";
import NeighborhoodFilter from "./Filters/NeighborhoodFilter";
import PlanFilter from "./Filters/PlanFilter";
import TimeFilter from "./Filters/TimeFilter";
import WeekDayFilter from "./Filters/WeekDayFilter";
import { Client } from '@notionhq/client';
import ApiGateway from "./ApiGateway";
import { FilterCriteria } from "./GoogleSheetsApiAdapter";

export default class NotionApiAdapter implements ApiGateway {
	notion
	filters: Array<Filter> = [];

	constructor () {
		this.notion = new Client({ auth: process.env.NOTION_API_SECRET ?? '' });
	}
	getBikeStations(databaseId: string, sheetName: string, criteria: FilterCriteria): Promise<any> {
		throw new Error("Method not implemented.");
	}

	async searchBikeStations(databaseId: string, term: string): Promise<any> {
		const response = await this.notion.search({
			query: 'External tasks',
			filter: {
				value: 'database',
				property: 'object'
			},
			sort: {
				direction: 'ascending',
				timestamp: 'last_edited_time'
			},
		});
	}
	
	async getPage(pageId: string): Promise<any> {

		const response = await this.notion.pages.retrieve({ page_id: pageId });
		return response;
	}

	async getDatabaseFilters(databaseId: string): Promise<Array<Filter>> {
		const response = await this.notion.databases.retrieve({
			database_id: databaseId, 
		});

		if (response.properties['Bairro'].type == 'multi_select') {
			const neighborhoodFilter = new NeighborhoodFilter();
			neighborhoodFilter.make(response.properties['Bairro'].multi_select.options);
			this.filters.push(neighborhoodFilter);
		}

		if (response.properties['Plano'].type == 'multi_select') {
			const planFilter = new PlanFilter();
			planFilter.make(response.properties['Plano'].multi_select.options);
			this.filters.push(planFilter);
		}

		if (response.properties['Dia da Semana'].type == 'multi_select') {
			const weekDay = new WeekDayFilter();
			weekDay.make(response.properties['Dia da Semana'].multi_select.options);
			this.filters.push(weekDay);
		}

		if (response.properties['Cobrança Adicional'].type == 'multi_select') {
			const addCharge = new AddChargeFilter();
			addCharge.make(response.properties['Cobrança Adicional'].multi_select.options);
			this.filters.push(addCharge);
		}

		if (response.properties['Horário'].type == 'multi_select') {
			const time = new TimeFilter();
			time.make(response.properties['Horário'].multi_select.options);
			this.filters.push(time);
		}
		return this.filters;
	}

	async queryDatabase(databaseId: string, filters: Array<any>): Promise<any> {
    const response = await this.notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
				{
					and: [
						{
							property: "Endereço",
							"rich_text": {
								"contains": "R. Leôncio de Car"
							}
						},
						{
							property: "Bairro",
							"multi_select": {
								"contains": "Moema"
							}
						}
					]
				}
			]
      }
    });

		return response;
	}

	filterMechanics(price:number = 0) {
		return {
			property: 'Mecânica',
			number: {
				equals: price,
			},
		}
	}
	
	filterElectrical(price:number = 0) {
		return {
			property: 'Elétrica',
			number: {
				equals: price,
			},
		}
	}
	
}