import { prompters } from "./prompters";

window.getPrompts = async (text: string): Promise<Prompt[]> => {
  let promises: Promise<Prompt[]>[] = [];
  for (const prompter of prompters) {
    promises.push(
      prompter(text).catch((e) => {
        console.error(e);
        return [];
      })
    );
  }
  let promptsList = await Promise.all(promises);
  return promptsList.flat();
};
