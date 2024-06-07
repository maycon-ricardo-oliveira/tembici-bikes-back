import 'reflect-metadata';
import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import GetBikeStations from "./GetBikeStations";
import GoogleSheetsApiAdapter from "./GoogleSheetsApiAdapter";
import dotenv from 'dotenv';
import SearchBikeStationsController from "./SearchBikeStationsController";
import SearchBikeStations from "./SearchBikeStations";
import CacheFileManager from './CacheFileManager';
import ResetCacheController from './ResetCacheController';
import ResetCache from './ResetCache';

dotenv.config();

const port = parseInt(process.env.PORT || "3030", 10);

const cacheManager = new CacheFileManager();

const googleSheetsApiAdapter = new GoogleSheetsApiAdapter(cacheManager);
const httpServer = new ExpressAdapter();

const getBikeStations = new GetBikeStations(googleSheetsApiAdapter);
const searchBikeStations = new SearchBikeStations(googleSheetsApiAdapter);
const resetCache = new ResetCache(cacheManager)

new BikeStationsController(httpServer, getBikeStations);
new SearchBikeStationsController(httpServer, searchBikeStations);
new ResetCacheController(httpServer, resetCache);

console.log(":)")
httpServer.listen(port);