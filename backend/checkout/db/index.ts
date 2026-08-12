import { SQLDatabase } from "encore.dev/storage/sqldb";
export default new SQLDatabase("checkout_db", { migrations: "./migrations" });
