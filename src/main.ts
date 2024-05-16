import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import FiltersController from "./FiltersController";
import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import GoogleSheetsApiAdapter from "./GoogleSheetsApiAdapter";
import NotionApiAdapter from "./NotionApiAdapter";


// const notionApiAdapter = new NotionApiAdapter();

const googleSheetsApiAdapter = new GoogleSheetsApiAdapter();
const httpServer = new ExpressAdapter();


const getBikeStations = new GetBikeStations(googleSheetsApiAdapter);
const getFilters = new GetFilters(googleSheetsApiAdapter);


new BikeStationsController(httpServer, getBikeStations);
new FiltersController(httpServer, getFilters);


httpServer.listen(3030);

