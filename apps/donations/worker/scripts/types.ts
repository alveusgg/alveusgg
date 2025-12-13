export interface ParsedMessage {
  original: string;
  unescaped: string;
  parsed: {
    json: {
      id: string;
      tags: Record<string, string | undefined>;
    };
  };
}
