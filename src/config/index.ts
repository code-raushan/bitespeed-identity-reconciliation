import dotenv from "dotenv";
dotenv.config();

const config = {
    DATABASE_URL: process.env.DATABASE_URL! as string,
    PORT: process.env.PORT! as string,
    PG_DATABASE_HOST: process.env.PG_DATABASE_HOST! as string,
    PG_DATABASE_USER: process.env.PG_DATABASE_USER! as string,
    PG_DATABASE_PASSWORD: process.env.PG_DATABASE_PASSWORD! as string,
    PG_DATABASE_PORT: process.env.PG_DATABASE_PORT! as string,
    PG_DATABASE: process.env.PG_DATABASE! as string,
}

export default config;