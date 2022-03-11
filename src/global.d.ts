interface Window {
  getPrompts: (text: string) => Promise<Prompt[]>;
}

type PromptType = "length" | "temperature" | "weight" | "currency";

interface Prompt {
  type: PromptType;
  source: string;
  hint: string;
}

type Prompter = (text: string) => Promise<Prompt[]>;
