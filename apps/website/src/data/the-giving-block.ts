export type TheGivingBlockConfig = {
  id: string;
  apiUserUuid: string;
  domain: string;
  buttonId: string;
  scriptId: string;
  uiVersion: string;
  donationFlow: string;
  fundraiserId: string;
  campaignId: string;
};

export const theGivingBlockConfig = {
  id: "861772907",
  apiUserUuid: "e6cf7d18-41b6-4a6c-954a-338578fd90b0",
  domain: "https://widget.thegivingblock.com",
  buttonId: "tgb-widget-button",
  scriptId: "tgb-widget-script",
  uiVersion: "2",
  donationFlow: "card,crypto,stock,daf",
  fundraiserId: "",
  campaignId: "",
} as const satisfies TheGivingBlockConfig;
