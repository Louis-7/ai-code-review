// entry point of GitHub Actions
const { run } = require("@probot/adapter-github-actions");
const app = require("./index");

run(app).catch((error: any) => {
  console.log(error);
  process.exit(1)
});