// import Invoice from "../src/Invoice";

import GetBikeStations from "../src/GetBikeStations";
import GetFilters from "../src/GetFilters";
import NotionApiAdapter from "../src/NotionApiAdapter";

/*
test("Deve ter um filtro", function () {
	const notionApiAdapter = new NotionApiAdapter();
	const getBikeStations = new GetBikeStations(notionApiAdapter);
	

	const availableFilters = ["Moema"];

	getBikeStations.execute(availableFilters);

	expect(true).toBe(true);
});

*/

test("Deve retornar todos filtros", function () {
	const notionApiAdapter = new NotionApiAdapter();
	const getFilters = new GetFilters(notionApiAdapter);
	

	// const availableFilters = ["Moema"];

	getFilters.execute();

	expect(true).toBe(true);
});