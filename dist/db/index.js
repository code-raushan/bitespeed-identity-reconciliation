"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForDBConnection = exports.db = exports.pool = void 0;
const kysely_1 = require("kysely");
const pg_1 = require("pg");
const config_1 = __importDefault(require("../config"));
const logger_util_1 = __importDefault(require("../utils/logger.util"));
exports.pool = new pg_1.Pool({
    host: config_1.default.PG_DATABASE_HOST,
    user: config_1.default.PG_DATABASE_USER,
    password: config_1.default.PG_DATABASE_PASSWORD,
    port: Number(config_1.default.PG_DATABASE_PORT),
    database: config_1.default.PG_DATABASE,
});
const dialect = new kysely_1.PostgresDialect({
    pool: exports.pool
});
exports.db = new kysely_1.Kysely({ dialect });
const waitForDBConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield exports.pool.connect();
        logger_util_1.default.info("Database connected");
        client.release();
    }
    catch (error) {
        logger_util_1.default.error(error);
        logger_util_1.default.error("Database connection failed");
    }
});
exports.waitForDBConnection = waitForDBConnection;
