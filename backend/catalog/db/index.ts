import { SQLDatabase } from "encore.dev/storage/sqldb";
export default new SQLDatabase("catalog_db", { migrations: "./migrations" });
