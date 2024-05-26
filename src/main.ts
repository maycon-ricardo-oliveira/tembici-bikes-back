import { makeConsoleLogger } from "@notionhq/client/build/src/logging";
import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import FiltersController from "./FiltersController";
import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import GoogleSheetsApiAdapter, { FilterCriteria } from "./GoogleSheetsApiAdapter";

const spreadsheetId = "1g_uXx2sEpwnhwWBtuD_KAfeqe3fhgwHXtOg5muG7mXM";

const googleSheetsApiAdapter = new GoogleSheetsApiAdapter();
const httpServer = new ExpressAdapter();

const getBikeStations = new GetBikeStations(googleSheetsApiAdapter, spreadsheetId);
const getFilters = new GetFilters(googleSheetsApiAdapter, spreadsheetId);


// // Exemplo de uso com critérios de filtro
// const criteria: FilterCriteria = {
//   endereço: "Rua Ceará 100",
//   preço: '10',
//   tipo: "mecanica",
//   Horário: "18:00 até 22:00",
//   Bairro: "São Geraldo",
//   Plano: "Completo"
// };

// googleSheetsApiAdapter.searchBikeStations(spreadsheetId, criteria).then(filteredData => {
//   console.log('Filtered Data:', filteredData);
// });

// googleSheetsApiAdapter.getDatabaseFilters(spreadsheetId).then(filteredData => {
//   console.log('Filtered Data:', filteredData);
// });

new BikeStationsController(httpServer, getBikeStations);
new FiltersController(httpServer, getFilters);


console.log('Ready ;)')
httpServer.listen(3030);

