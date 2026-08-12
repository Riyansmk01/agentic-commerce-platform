import { SQLDatabase } from "encore.dev/storage/sqldb";
export default new SQLDatabase("analytics_db", { migrations: "./migrations" });
