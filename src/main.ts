import 'reflect-metadata';
import BikeStationsController from "./BikeStationsController";
import ExpressAdapter from "./ExpressAdapter";
import GetBikeStations from "./GetBikeStations";
import GoogleSheetsApiAdapter from "./GoogleSheetsApiAdapter";
import dotenv from 'dotenv';
import SearchBikeStationsController from "./SearchBikeStationsController";
import SearchBikeStations from "./SearchBikeStations";
import CacheFileManager from './CacheFileManager';
import path from 'path';
import ResetCacheController from './ResetCacheController';
import ResetCache from './ResetCache';

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
const resetCache = new ResetCache(cache, config)

new BikeStationsController(httpServer, getBikeStations);
new SearchBikeStationsController(httpServer, searchBikeStations);
new ResetCacheController(httpServer, resetCache);

console.log(":)")
httpServer.listen(port);