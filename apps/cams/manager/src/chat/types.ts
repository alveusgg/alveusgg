export type User = {
  id: string;
  login: string;
  name: string;
  mod: boolean;
  sub: boolean;
  vip: boolean;
  broadcaster: boolean;
};

export interface ChatMessage {
  id: string;
  user: User;
  text: string;
}
