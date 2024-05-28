import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import FiltersController from "./FiltersController";
import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import GoogleSheetsApiAdapter from "./GoogleSheetsApiAdapter";
import dotenv from 'dotenv';

dotenv.config();

const spreadsheetId = "1g_uXx2sEpwnhwWBtuD_KAfeqe3fhgwHXtOg5muG7mXM";
const sheetName = 'Testing';
const port = parseInt(process.env.PORT || "3030", 10);

const googleSheetsApiAdapter = new GoogleSheetsApiAdapter();
const httpServer = new ExpressAdapter();

const getBikeStations = new GetBikeStations(googleSheetsApiAdapter, spreadsheetId);
const getFilters = new GetFilters(googleSheetsApiAdapter, spreadsheetId, sheetName);

new BikeStationsController(httpServer, getBikeStations);
new FiltersController(httpServer, getFilters);

httpServer.listen(port);