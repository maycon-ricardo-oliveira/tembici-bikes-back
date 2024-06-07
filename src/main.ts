import 'reflect-metadata';
import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import FiltersController from "./FiltersController";
import GetBikeStations from "./GetBikeStations";
import GetFilters from "./GetFilters";
import GoogleSheetsApiAdapter from "./GoogleSheetsApiAdapter";
import dotenv from 'dotenv';
import SearchBikeStationsController from "./SearchBikeStationsController";
import SearchBikeStations from "./SearchBikeStations";
import CacheFileManager from './CacheFileManager';
import path from 'path';

dotenv.config();

const port = parseInt(process.env.PORT || "3030", 10);
const cacheFilePath = path.join(__dirname, 'bikeStationsCache.json');
const configFilePath = path.join(__dirname, 'configs.json');

const cache = new CacheFileManager(cacheFilePath);
const config = new CacheFileManager(configFilePath);

const googleSheetsApiAdapter = new GoogleSheetsApiAdapter(cache, config);
const httpServer = new ExpressAdapter();

const getBikeStations = new GetBikeStations(googleSheetsApiAdapter);
const searchBikeStations = new SearchBikeStations(googleSheetsApiAdapter);
const getFilters = new GetFilters(googleSheetsApiAdapter);

new BikeStationsController(httpServer, getBikeStations);
new FiltersController(httpServer, getFilters);
new SearchBikeStationsController(httpServer, searchBikeStations);


httpServer.listen(port);