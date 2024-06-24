const { execSync } = require("child_process");
const { readFileSync } = require("fs");
const path = require("path");

function loadEnvFile(envFilePath) {
  const envFile = readFileSync(envFilePath, "utf8");
  const envVariables = envFile
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"));
  envVariables.forEach((variable) => {
    const [key, value] = variable.split("=");
    process.env[key] = value;
  });
}

// Load environment variables
loadEnvFile(path.resolve(__dirname, "../apps/backoffice-api/.env"));
loadEnvFile(path.resolve(__dirname, "../apps/game-api/.env"));

// Run Docker Compose and Turbo
execSync("docker-compose up -d", { stdio: "inherit" });
