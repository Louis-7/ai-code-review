import { OpenAIEngine } from "./openai-engine";
import { AzureOpenAIEngine } from "./azure-openai-engine";

export class CodeReviewFactory {
  static createEngine(engineType: string) {
    console.log('🤖 Initializing code review engine');
    if (engineType == "openai") {
      console.log('🤖 OpenAI will used as code review engine.');
      return new OpenAIEngine();
    } else if (engineType == "azureopenai") {
      console.log('🤖 Azure OpenAI will used as code review engine.');
      return new AzureOpenAIEngine()
    } else {
      throw new Error("Specified engine is not supported yet.");
    }
  }
}
