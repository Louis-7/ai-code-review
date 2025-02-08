import { AzureOpenAI } from "openai";
import { GPTEngine } from "../../models/gpt-engine";
export declare class DeepSeekEngine implements GPTEngine {
    baseURL: string;
    apiKey: string;
    model: string;
    temperature: number;
    top_p: number;
    client: AzureOpenAI;
    constructor();
    test(): Promise<boolean>;
    chatCompletion(messages: string[]): Promise<string>;
}
