require("dotenv").config();

const { CronJob } = require("cron");
const backupDB = require("./src/schedules/backupDB");

console.log(__filename);

new CronJob("*/5 * * * * *", backupDB, null, true);
