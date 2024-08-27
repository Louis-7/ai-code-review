import { OpenAIEngine } from "./openai-engine";
import { AzureOpenAIEngine } from "./azure-openai-engine";

export class CodeReviewFactory {
  static createEngine(engineType: string) {
    if (engineType == "openai") {
      return new OpenAIEngine();
    } else if (engineType == "azureopenai") {
      return new AzureOpenAIEngine()
    } else {
      throw new Error("Specified engine is not supported yet.");
    }
  }
}
