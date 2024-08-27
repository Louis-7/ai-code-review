import { OpenAI, AzureOpenAI } from "openai";
import { GPTEngine } from "../../models/gpt-engine";

export class AzureOpenAIEngine implements GPTEngine {
  baseURL: string = process.env.AZURE_OPENAI_BASE_URL || "";
  apiKey: string = process.env.AZURE_OPENAI_API_KEY || "";
  apiVersion: string = process.env.AZURE_API_VERSION || "";
  deployment: string = process.env.AZURE_DEPLOYMENT || "";
  model: string = process.env.CHAT_GPT_MODEL || "gpt-3.5-turbo";
  temperature: number = Number(process.env.TEMPERATURE) || 1;
  top_p: number = Number(process.env.TOP_P) || 1;

  client: AzureOpenAI;

  constructor() {
    this.client = new AzureOpenAI({
      baseURL: this.baseURL,
      apiKey: this.apiKey,
      apiVersion: this.apiVersion,
      deployment: this.deployment,
    });
  }

  async test(): Promise<boolean> {
    try {
      const res = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: "This is a test message." }],
      });

      return !!res;
    } catch (err) {
      return false;
    }
  }

  async chatCompletion(messages: string[]) {
    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.model,
      temperature: this.temperature,
      top_p: this.top_p,
      messages: messages.map((message) => ({
        role: "user",
        content: message,
      })),
    };

    return await this.client.chat.completions
      .create(params)
      .then((response) => {
        const choices = response.choices;

        if (choices.length <= 0) {
          return "";
        }

        const representativeChoice = choices[0];

        return representativeChoice.message?.content || "";
      });
  }
}
