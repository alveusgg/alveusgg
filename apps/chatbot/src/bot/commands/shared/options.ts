import { notEmpty, typeSafeObjectKeys } from "@/utils/helpers";

type BaseOptionConfig = {
  help?: string;
  default?: unknown;
};

type BooleanOptionConfig = BaseOptionConfig & {
  type: "boolean";
  default: boolean;
};

type UrlOptionConfig = BaseOptionConfig & {
  type: "url";
  default?: string;
};

type OptionConfig = BooleanOptionConfig | UrlOptionConfig;

type GenericOptions = {
  [key: string]: OptionConfig;
};

type OptionName<TOptions extends GenericOptions> = keyof TOptions;

type OptionTypes = OptionConfig["type"];

type OptionTypeConfigs = {
  [K in OptionTypes]: Extract<OptionConfig, { type: K }>;
};

type OptionValues<TOptions extends GenericOptions> = {
  [K in keyof TOptions]: OptionTypeConfigs[TOptions[K]["type"]]["default"];
};

const getBaseOptionByName = <TOptions extends GenericOptions>(
  options: TOptions,
  optionName: keyof TOptions,
) => {
  return options[optionName] as OptionConfig;
};

function parseOptionParams<TOptions extends GenericOptions>(
  defaultValues: OptionValues<TOptions>,
  params: string[],
  options: TOptions,
) {
  const errors: string[] = [];
  const values = { ...defaultValues };
  const restParams = params.filter((param) => {
    if (!param.startsWith("--")) {
      return true;
    }

    const paramName = param.slice(2).split("=", 1)[0] as string;
    if (!(paramName in options)) {
      return true;
    }

    const optionName = paramName as OptionName<TOptions>;
    const option = options[optionName] as OptionConfig;

    if (option.type === "boolean") {
      values[optionName] = true;
    } else if (option.type === "url") {
      const maybeUrl = param.slice(2 + paramName.length + 1);
      try {
        values[optionName] = new URL(maybeUrl).toString();
      } catch (e) {
        errors.push(`Invalid URL for ${String(optionName)}`);
      }
    }

    return false;
  });

  return {
    values,
    restParams,
    errors,
  };
}

function renderOptionsHelp<TOptions extends GenericOptions>(options: TOptions) {
  return typeSafeObjectKeys(options)
    .map((optionName) => {
      const option = getBaseOptionByName(options, optionName);
      if (!option.help) return undefined;
      const optionNameString = String(optionName);
      let command: string;
      switch (option.type) {
        case "url":
          command = `${optionNameString}=<url>`;
          break;
        case "boolean":
          command = optionNameString;
          break;
      }
      return `--${command} - ${option.help}`;
    })
    .filter(notEmpty)
    .join(" | ");
}

export function createOptions<TOptions extends GenericOptions>(
  options: TOptions,
) {
  const defaultValues = Object.fromEntries(
    typeSafeObjectKeys(options).map((optionName) => {
      const option = getBaseOptionByName(options, optionName);
      return [optionName, option.default];
    }),
  ) as OptionValues<TOptions>;

  return {
    parseParams: (params: string[]) =>
      parseOptionParams(defaultValues, params, options),
    renderHelp: () => renderOptionsHelp(options),
  };
}
