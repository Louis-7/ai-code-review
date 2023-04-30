const {
  createAzureFunction,
  createProbot,
} = require("@probot/adapter-azure-functions");
const app = require("../../src/index");
module.exports = createAzureFunction(app, {
  probot: createProbot(),
});