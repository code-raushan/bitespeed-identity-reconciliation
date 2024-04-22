"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT,
    PG_DATABASE_HOST: process.env.PG_DATABASE_HOST,
    PG_DATABASE_USER: process.env.PG_DATABASE_USER,
    PG_DATABASE_PASSWORD: process.env.PG_DATABASE_PASSWORD,
    PG_DATABASE_PORT: process.env.PG_DATABASE_PORT,
    PG_DATABASE: process.env.PG_DATABASE,
};
exports.default = config;
