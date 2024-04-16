import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import FiltersController from "./FiltersController";
import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import NotionApiAdapter from "./NotionApiAdapter";


const notionApiAdapter = new NotionApiAdapter();
const httpServer = new ExpressAdapter();


const getBikeStations = new GetBikeStations(notionApiAdapter);
const getFilters = new GetFilters(notionApiAdapter);


new BikeStationsController(httpServer, getBikeStations);
new FiltersController(httpServer, getFilters);


httpServer.listen(3030);

