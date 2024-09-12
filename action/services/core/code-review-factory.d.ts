import { OpenAIEngine } from "./openai-engine";
import { AzureOpenAIEngine } from "./azure-openai-engine";
export declare class CodeReviewFactory {
    static createEngine(engineType: string): OpenAIEngine | AzureOpenAIEngine;
}
