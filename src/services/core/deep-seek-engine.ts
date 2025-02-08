import { OpenAI } from "openai";
import { GPTEngine } from "../../models/gpt-engine";

export class DeepSeekEngine implements GPTEngine {
  baseURL: string = process.env.DEEPSEEK_BASE_URL || "";
  apiKey: string = process.env.DEEPSEEK_API_KEY || "";
  model: string = process.env.CHAT_GPT_MODEL || "deepseek-chat";
  temperature: number = Number(process.env.TEMPERATURE) || 0;
  top_p: number = Number(process.env.TOP_P) || 1;

  client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: this.baseURL,
      apiKey: this.apiKey
    });
  }

  async test(): Promise<boolean> {
    try {
      const res = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: "This is a test message." }],
      });
      console.log(res);
      console.log('Engine test passed.');
      return !!res;
    } catch (err) {
      console.log(err);
      console.log('Engine test failed.');
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
