import { api } from "encore.dev/api";
import { CronJob } from "encore.dev/cron";
import db from "./db";

export const expireCheckouts = api(
  { expose: false, method: "POST", path: "/checkout/expire" },
  async () => {
    await db.exec`
      UPDATE checkout_sessions SET status = 'expired', updated_at = NOW()
      WHERE status = 'open' AND expires_at < NOW()
    `;
  }
);

const _ = new CronJob("expire-checkouts", {
  title: "Expire old checkout sessions",
  every: "5m",
  endpoint: expireCheckouts,
});
