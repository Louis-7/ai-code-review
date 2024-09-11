import { AzureOpenAI } from "openai";
import { GPTEngine } from "../../models/gpt-engine";
export declare class AzureOpenAIEngine implements GPTEngine {
    baseURL: string;
    apiKey: string;
    apiVersion: string;
    deployment: string;
    model: string;
    temperature: number;
    top_p: number;
    client: AzureOpenAI;
    constructor();
    test(): Promise<boolean>;
    chatCompletion(messages: string[]): Promise<string>;
}
