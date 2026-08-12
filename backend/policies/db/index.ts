import { SQLDatabase } from "encore.dev/storage/sqldb";
export default new SQLDatabase("policies_db", { migrations: "./migrations" });
