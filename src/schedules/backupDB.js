const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

function backupDB() {
  const backupDir = path.join(process.cwd(), "db_backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `backup-${timestamp}.sql`);

  const mysqldump = spawn("mysqldump", [
    "-uroot",
    "-p12345678",
    "-P3306",
    "todo_dev",
  ]);

  const writeStream = fs.createWriteStream(backupFile);

  // ⭐ PIPE STREAM (QUAN TRỌNG NHẤT)
  mysqldump.stdout.pipe(writeStream);

  mysqldump.stderr.on("data", (data) => {
    console.error(`mysqldump error: ${data}`);
  });

  writeStream.on("finish", () => {
    console.log(`✅ Database backup saved to ${backupFile}`);
  });

  writeStream.on("error", (err) => {
    console.error("❌ Write stream error:", err);
  });

  mysqldump.on("close", (code) => {
    if (code !== 0) {
      console.error(`❌ mysqldump exited with code ${code}`);
    }
  });
}

module.exports = backupDB;
