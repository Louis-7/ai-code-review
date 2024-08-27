import { OpenAIEngine } from "./openai-engine";

export class CodeReviewFactory {
  static createEngine(engineType: string) {
    if (engineType == "openai") {
      return new OpenAIEngine();
    } else if (engineType == "azureopenai") {
      // return azure engine;
    } else {
      throw new Error("Specified engine is not supported yet.");
    }

    return new OpenAIEngine
  }
}
