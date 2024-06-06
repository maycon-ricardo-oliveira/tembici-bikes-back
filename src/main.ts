import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import FiltersController from "./FiltersController";
import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import GoogleSheetsApiAdapter from "./GoogleSheetsApiAdapter";
import dotenv from 'dotenv';
import SearchBikeStationsController from "./SearchBikeStationsController";
import SearchBikeStations from "./SearchBikeStations";

dotenv.config();

const sheetName = 'Testing';
const port = parseInt(process.env.PORT || "3030", 10);

const googleSheetsApiAdapter = new GoogleSheetsApiAdapter();
const httpServer = new ExpressAdapter();

const getBikeStations = new GetBikeStations(googleSheetsApiAdapter);
const searchBikeStations = new SearchBikeStations(googleSheetsApiAdapter);
const getFilters = new GetFilters(googleSheetsApiAdapter);

new BikeStationsController(httpServer, getBikeStations);
new FiltersController(httpServer, getFilters);
new SearchBikeStationsController(httpServer, searchBikeStations);


httpServer.listen(port);