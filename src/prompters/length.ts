const UNIT_GROUP_DICT = {
  inches: ["inch", "inches", "in", '"'],
  miles: ["miles", "mile"],
  meters: ["meters", "meter", "m"],
  centimeters: ["centimeters", "centimeter", "cm"],
  millimeters: ["millimeters", "millimeter", "mm"],
  yards: ["yards", "yard"],
  feet: ["feet", "ft", "'"],
};

const UNIT_VALUE_DICT = {
  inches: 2.54,
  miles: 160934.4,
  meters: 100,
  centimeters: 1,
  millimeters: 0.1,
  yards: 91.44,
  feet: 30.48,
};

const REGEX_LENGTH_SPECIAL = new RegExp(
  "" +
    /([\d\,]+)/.source +
    /\s*/.source +
    `(?:${UNIT_GROUP_DICT["feet"].join("|")})` +
    /\s*/.source +
    /(?:and|&)*/.source +
    /\s*/.source +
    /([\d\.\,]+)/.source +
    /\s*/.source +
    `(?:${UNIT_GROUP_DICT["inches"].join("|")})` +
    /(?=[^a-z"']|$|\n)/.source,
  "gi"
);

const REGEX_LENGTH = new RegExp(
  "" +
    /([\d\.\,]+)/.source +
    /\s*/.source +
    `(${Object.values(UNIT_GROUP_DICT).flat().join("|")})` +
    /(?=[^a-z"']|$|\n)/.source,
  "gi"
);

type LengthType = keyof typeof UNIT_GROUP_DICT;

export function lengthToPrompt(
  type: LengthType,
  length: number,
  source: string
): Prompt {
  let lengthInCM =
    (length * UNIT_VALUE_DICT[type]) / UNIT_VALUE_DICT["centimeters"];

  let hint: string;

  if (type === "meters" || type === "centimeters" || type === "millimeters") {
    let inches = lengthInCM / UNIT_VALUE_DICT["inches"];
    let feet = lengthInCM / UNIT_VALUE_DICT["feet"];
    let yards = lengthInCM / UNIT_VALUE_DICT["yards"];

    hint = `${inches.toFixed(2)} in = ${feet.toFixed(2)} ft = ${yards.toFixed(
      2
    )} yards`;
  } else {
    let meters = lengthInCM / UNIT_VALUE_DICT["meters"];
    let centimeters = lengthInCM / UNIT_VALUE_DICT["centimeters"];
    let millimeters = lengthInCM / UNIT_VALUE_DICT["millimeters"];
    hint = `${meters.toFixed(2)} m = ${centimeters.toFixed(
      2
    )} cm = ${millimeters.toFixed(2)} mm`;
  }

  return {
    type: "length",
    source: source.trim(),
    hint,
  };
}

export default async function prompter(text: string): Promise<Prompt[]> {
  let prompts: Prompt[] = [];

  let matchedSpecialTextList: string[] = [];
  let execArray: RegExpExecArray | null;
  while ((execArray = REGEX_LENGTH_SPECIAL.exec(text))) {
    matchedSpecialTextList.push(execArray[0]);
    let feet = parseFloat(execArray[1]);
    let inches = parseFloat(execArray[2]);
    inches =
      inches + feet * (UNIT_VALUE_DICT["feet"] / UNIT_VALUE_DICT["inches"]);
    let prompt = lengthToPrompt("inches", inches, execArray[0]);
    prompts.push(prompt);
  }

  for (let matchedText of matchedSpecialTextList) {
    text = text.replace(matchedText, "");
  }

  while ((execArray = REGEX_LENGTH.exec(text))) {
    let length = parseFloat(execArray[1]);
    let unit = execArray[2];
    let type = Object.keys(UNIT_GROUP_DICT).find((key) =>
      UNIT_GROUP_DICT[key as LengthType].includes(unit)
    );
    if (!type) {
      continue;
    }
    let prompt = lengthToPrompt(type as LengthType, length, execArray[0]);
    prompts.push(prompt);
  }

  return prompts;
}
