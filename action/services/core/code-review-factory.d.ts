import { OpenAIEngine } from "./openai-engine";
import { AzureOpenAIEngine } from "./azure-openai-engine";
import { DeepSeekEngine } from "./deep-seek-engine";
export declare class CodeReviewFactory {
    static createEngine(engineType: string): OpenAIEngine | AzureOpenAIEngine | DeepSeekEngine;
}
