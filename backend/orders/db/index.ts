import { SQLDatabase } from "encore.dev/storage/sqldb";
export default new SQLDatabase("orders_db", { migrations: "./migrations" });
