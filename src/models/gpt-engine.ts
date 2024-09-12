export interface GPTEngine {
  /**
   * A function to test gpt engine
   */
  test(): Promise<boolean>;

  /**
   * Call gpt engine to chat
   * @param message chat message
   */
  chatCompletion(message: string[]): Promise<string>;
}
