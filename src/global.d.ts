interface Window {
  getPrompts: (text: string) => Promise<Prompt[]>;
}

type PromptType = "length" | "temperature" | "weight" | "currency";

interface PromptHintItem {
  value: string;
  unit: string;
}

interface Prompt {
  type: PromptType;
  source: string;
  hint: string | PromptHintItem | PromptHintItem[];
}

type Prompter = (text: string) => Promise<Prompt[]>;
