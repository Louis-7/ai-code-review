import { Configuration, OpenAIApi } from 'openai';
export declare class OpenAI {
    OPENAI_API_KEY: string;
    MODEL: string;
    TEMPERATURE: number;
    TOP_P: number;
    configuration: Configuration;
    openai: OpenAIApi;
    constructor();
    test(): Promise<boolean>;
    chat(messages: string[]): Promise<string>;
}
