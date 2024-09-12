import { OpenAI } from "openai";
import { GPTEngine } from "../../models/gpt-engine";
export declare class OpenAIEngine implements GPTEngine {
    OPENAI_API_KEY: string;
    MODEL: string;
    TEMPERATURE: number;
    TOP_P: number;
    client: OpenAI;
    constructor();
    test(): Promise<boolean>;
    chatCompletion(messages: string[]): Promise<string>;
}
