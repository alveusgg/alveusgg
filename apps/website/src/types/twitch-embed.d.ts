/* eslint-disable @typescript-eslint/no-explicit-any */
declare let Twitch: any;

declare global {
  interface Window {
    Twitch: any;
  }
}
