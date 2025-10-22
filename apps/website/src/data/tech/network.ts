type NetworkConnectionCore = {
  type: string;
};

type NetworkConnectionWired = NetworkConnectionCore & {
  type: "ethernet" | "fiber" | "coax";
  location: "buried" | "overhead" | "wall";
  accessories?: { name: string; model: string; url: string }[];
};

type NetworkConnectionWireless = NetworkConnectionCore & {
  type: "wifi" | "cloud";
};

export type NetworkConnection =
  | NetworkConnectionWired
  | NetworkConnectionWireless;

type NetworkItemCore = {
  type: string;
  name: string;
  model: string;
  url?: string;
};

type NetworkItemSwitch = NetworkItemCore & {
  type: "switch" | "converter" | "interface" | "controlunit";
  links: NestedNetworkItem[];
};

type NetworkItemCamera = NetworkItemCore & {
  type: "camera" | "microphone" | "speaker";
};

type NetworkItemAccessPoint = NetworkItemCore & {
  type: "accessPoint";
  links?: NestedNetworkItem[]; // Some Ubiquiti APs have a second ethernet port
};

type NetworkItemServer = NetworkItemCore & {
  type: "server";
  links?: NestedNetworkItem[]; // Allows the Cloud OBS to be at the root of the network
};

export type RootNetworkItem =
  | NetworkItemSwitch
  | NetworkItemCamera
  | NetworkItemAccessPoint
  | NetworkItemServer;
export type NestedNetworkItem = RootNetworkItem & {
  connection: NetworkConnection;
};
export type NetworkItem = NestedNetworkItem | RootNetworkItem;

export const isNetworkItem = (item: unknown): item is NetworkItem =>
  !!item &&
  typeof item === "object" &&
  "type" in item &&
  typeof item.type === "string" &&
  "name" in item &&
  typeof item.name === "string" &&
  "model" in item &&
  typeof item.model === "string" &&
  (!("url" in item) || typeof item.url === "string") &&
  (!("links" in item) ||
    (Array.isArray(item.links) && item.links.every(isNetworkItem))) &&
  (!("connection" in item) ||
    (typeof item.connection === "object" &&
      item.connection !== null &&
      "type" in item.connection &&
      typeof item.connection.type === "string"));

export const isRootNetworkItem = (item: NetworkItem): item is RootNetworkItem =>
  !("connection" in item);
export const isNestedNetworkItem = (
  item: NetworkItem,
): item is NestedNetworkItem => "connection" in item;

const data: RootNetworkItem[] = [
  {
    type: "server",
    name: "Cloud OBS",
    model: "Open Broadcaster Software",
    url: "https://obsproject.com",
    links: [
      {
        type: "switch",
        name: "Studio",
        model: "Ubiquiti USW-24-PoE",
        url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-24-poe",
        connection: { type: "cloud" },
        links: [
          {
            type: "server",
            name: "Local OBS",
            model: "Open Broadcaster Software",
            url: "https://obsproject.com",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "accessPoint",
            name: "Studio",
            model: "Ubiquiti UAP-FlexHD",
            url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/uap-flexhd",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "switch",
            name: "Reptile Room",
            model: "Ubiquiti USW-24-PoE",
            url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-24-poe",
            connection: { type: "ethernet", location: "wall" },
            links: [
              {
                type: "camera",
                name: "Noodle",
                model: "AXIS M5525-E (PTZ)",
                url: "https://www.axis.com/products/axis-m5525-e",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Patchy",
                model: "AXIS M5075-G (PTZ)",
                url: "https://www.axis.com/products/axis-m5075-g",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Toast",
                model: "AXIS M5075-G (PTZ)",
                url: "https://www.axis.com/products/axis-m5075-g",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Georgie",
                model: "AXIS M5075-G (PTZ)",
                url: "https://www.axis.com/products/axis-m5075-g",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Georgie Water",
                model: "AXIS P1245 (Fixed)",
                url: "https://www.axis.com/products/axis-p1245",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "switch",
                name: "Critter Cave Upper",
                model: "Ubiquiti USW-Lite-8-PoE",
                url: "https://store.ui.com/us/en/products/usw-lite-8-poe",
                connection: { type: "ethernet", location: "wall" },
                links: [
                  {
                    type: "camera",
                    name: "Zebra Isopod",
                    model: "AXIS M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Spanish Orange Isopod",
                    model: "AXIS M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  /*
                  {
                    type: "camera",
                    name: "Cockroach",
                    model: "AXIS M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Puppy",
                    model: "AXIS M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  */
                ],
              },
              {
                type: "switch",
                name: "Critter Cave Lower",
                model: "Ubiquiti USW-Lite-8-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
                connection: { type: "ethernet", location: "wall" },
                links: [
                  {
                    type: "camera",
                    name: "Hank",
                    model: "AXIS M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Hank Corner",
                    model: "AXIS M1065-LW (Fixed)",
                    url: "https://www.axis.com/products/axis-m1065-lw",
                    connection: { type: "ethernet", location: "wall" },
                  },
                ],
              },
            ],
          },
          {
            type: "switch",
            name: "HQ",
            model: "Ubiquiti USW-16-PoE",
            url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-16-poe",
            connection: { type: "ethernet", location: "buried" },
            links: [
              {
                type: "accessPoint",
                name: "HQ",
                model: "Ubiquiti UAP-FlexHD",
                url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/uap-flexhd",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "accessPoint",
                name: "Area Wide",
                model: "Ubiquiti UAP-AC-M-Pro",
                url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "switch",
                name: "Training Center",
                model: "Ubiquiti USW-Lite-8-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
                connection: { type: "ethernet", location: "overhead" },
                links: [
                  /*
                  {
                    type: "camera",
                    name: "Training Center",
                    model: "AXIS M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  */
                  {
                    type: "accessPoint",
                    name: "Pasture",
                    model: "Ubiquiti UAP-AC-M-Pro",
                    url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                    connection: { type: "ethernet", location: "buried" },
                  },
                ],
              },
              {
                type: "converter",
                name: "Pasture",
                model: "TP-Link MC220L",
                url: "https://www.tp-link.com/us/business-networking/accessory/mc220l/",
                connection: { type: "fiber", location: "wall" },
                links: [
                  {
                    type: "switch",
                    name: "Pasture",
                    model: "Ubiquiti USW-Lite-8-PoE",
                    url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "interface",
                        name: "Pasture Audio I/O",
                        model: "AXIS T6112 Mk II",
                        url: "https://www.axis.com/products/axis-t6112-mk-ii-audio-and-io-interface",
                        connection: { type: "ethernet", location: "wall" },
                        links: [
                          {
                            type: "camera",
                            name: "Pasture",
                            model: "AXIS Q6135-LE (PTZ)",
                            url: "https://www.axis.com/products/axis-q6135-le",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "microphone",
                            name: "Pasture Microphone",
                            model: "AXIS TU1001-VE",
                            url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                            connection: { type: "ethernet", location: "wall" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "accessPoint",
            name: "Studio Radio",
            model: "airMAX NanoStation 5AC Loco",
            url: "https://store.ui.com/us/en/products/loco5ac",
            connection: { type: "ethernet", location: "wall" },
            links: [
              {
                type: "accessPoint",
                name: "Parrot Radio",
                model: "airMAX NanoStation 5AC Loco",
                url: "https://store.ui.com/us/en/products/loco5ac",
                connection: { type: "wifi" },
                links: [
                  {
                    type: "switch",
                    name: "Parrot",
                    model: "Ubiquiti USW-24-PoE",
                    url: "https://store.ui.com/us/en/collections/unifi-switching-standard-power-over-ethernet/products/usw-24-poe",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "camera",
                        name: "Littles",
                        model: "AXIS P5676-LE (PTZ)",
                        url: "https://www.axis.com/products/axis-p5676-le",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Macaws",
                        model: "AXIS P5676-LE (PTZ)",
                        url: "https://www.axis.com/products/axis-p5676-le",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "speaker",
                        name: "Parrot Speaker",
                        model: "AXIS C1610-VE Network Sound Projector",
                        url: "https://www.axis.com/products/axis-c1610-ve",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "accessPoint",
                        name: "Parrot",
                        model: "Ubiquiti UAP-AC-M-Pro",
                        url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "interface",
                        name: "Parrot Audio I/O",
                        model: "AXIS P8221 I/O Audio Module",
                        url: "https://www.axis.com/products/axis-p8221-io-audio-module/support",
                        connection: { type: "ethernet", location: "wall" },
                        links: [
                          {
                            type: "microphone",
                            name: "Parrot Microphone",
                            model: "AXIS TU1001-VE",
                            url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                            connection: { type: "ethernet", location: "wall" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "switch",
            name: "Nutrition House",
            model: "Ubiquiti USW-24-PoE",
            url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-24-poe",
            connection: { type: "ethernet", location: "buried" },
            links: [
              {
                type: "camera",
                name: "Nutrition House",
                model: "OBSBOT Tiny 4K (PTZ)",
                url: "https://www.obsbot.com/obsbot-tiny-4k-webcam",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "accessPoint",
                name: "Nutrition House",
                model: "Ubiquiti UAP-FlexHD",
                url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/uap-flexhd",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "switch",
                name: "Wall Switch",
                model: "Ubiquiti USW-Lite-8-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
                connection: { type: "ethernet", location: "wall" },
                links: [
                  /*
                  {
                    type: "camera",
                    name: "Chinchilla",
                    model: "AXIS M1065-L (Fixed)",
                    url: "https://www.axis.com/products/axis-m1065-l/",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  */
                  {
                    type: "controlunit",
                    name: "Spare Control Module",
                    model: "AXIS F9114",
                    url: "https://www.axis.com/products/axis-f9114-main-unit/",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "camera",
                        name: "Spare Upper",
                        model: "AXIS F4105-LRE (Fixed)",
                        url: "https://www.axis.com/products/axis-f4105-lre-dome-sensor/",
                        connection: { type: "coax", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Spare Middle",
                        model: "AXIS F4105-LRE (Fixed)",
                        url: "https://www.axis.com/products/axis-f4105-lre-dome-sensor/",
                        connection: { type: "coax", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Spare Lower",
                        model: "AXIS F4105-LRE (Fixed)",
                        url: "https://www.axis.com/products/axis-f4105-lre-dome-sensor/",
                        connection: { type: "coax", location: "wall" },
                      },
                    ],
                  },
                  {
                    type: "controlunit",
                    name: "Chin Control Module",
                    model: "AXIS F9114",
                    url: "https://www.axis.com/products/axis-f9114-main-unit/",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "camera",
                        name: "Chin Upper",
                        model: "AXIS F4105-LRE (Fixed)",
                        url: "https://www.axis.com/products/axis-f4105-lre-dome-sensor/",
                        connection: { type: "coax", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Chin Middle",
                        model: "AXIS F4105-LRE (Fixed)",
                        url: "https://www.axis.com/products/axis-f4105-lre-dome-sensor/",
                        connection: { type: "coax", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Chin Lower",
                        model: "AXIS F4105-LRE (Fixed)",
                        url: "https://www.axis.com/products/axis-f4105-lre-dome-sensor/",
                        connection: { type: "coax", location: "wall" },
                      },
                    ],
                  },
                ],
              },
              {
                type: "switch",
                name: "Power Distribution",
                model: "Ubiquiti USW-Lite-8-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
                connection: { type: "ethernet", location: "buried" },
                links: [
                  {
                    type: "switch",
                    name: "Crow",
                    model: "Ubiquiti USW-Lite-16-PoE",
                    url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-16-poe",
                    connection: { type: "ethernet", location: "buried" },
                    links: [
                      {
                        type: "camera",
                        name: "Crow Outside",
                        model: "AXIS M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Crow Inside",
                        model: "AXIS M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "accessPoint",
                        name: "Crow",
                        model: "Ubiquiti UAP-AC-M-Pro",
                        url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "interface",
                        name: "Crow Audio I/O",
                        model: "AXIS P8221 I/O Audio Module",
                        url: "https://www.axis.com/products/axis-p8221-io-audio-module/support",
                        connection: { type: "ethernet", location: "wall" },
                        links: [
                          {
                            type: "microphone",
                            name: "Crow Microphone",
                            model: "AXIS TU1001-VE",
                            url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                            connection: { type: "ethernet", location: "wall" },
                          },
                        ],
                      },
                      {
                        type: "switch",
                        name: "Wolf",
                        model: "Ubiquiti USW-Pro-24-PoE",
                        url: "https://store.ui.com/us/en/collections/unifi-switching-pro-power-over-ethernet/products/usw-pro-24-poe",
                        connection: { type: "ethernet", location: "buried" },
                        links: [
                          {
                            type: "camera",
                            name: "Wolf SwitchPen",
                            model: "AXIS Q6155-E (PTZ)",
                            url: "https://www.axis.com/products/axis-q6115-e/",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "camera",
                            name: "Wolf Pond",
                            model: "AXIS Q6318-LE (PTZ)",
                            url: "https://www.axis.com/products/axis-q6318-le",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "camera",
                            name: "Wolf Deck",
                            model: "AXIS Q6318-LE (PTZ)",
                            url: "https://www.axis.com/products/axis-q6318-le",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "camera",
                            name: "Wolf Den 1",
                            model: "AXIS P1435-LE (Fixed)",
                            url: "https://help.axis.com/en-us/axis-p1435-le",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "camera",
                            name: "Wolf Indoor",
                            model: "AXIS P5676-LE (PTZ)",
                            url: "https://www.axis.com/products/axis-p5676-le",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "speaker",
                            name: "Wolf Speaker",
                            model: "AXIS C1610-VE Network Sound Projector",
                            url: "https://www.axis.com/products/axis-c1610-ve",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "accessPoint",
                            name: "Wolf Indoor",
                            model: "Ubiquiti UAP-AC-M",
                            url: "https://store.ui.com/us/en/collections/unifi-wifi-outdoor-long-range/products/uap-ac-mesh",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "switch",
                            name: "Wolf Deck",
                            model: "Ubiquiti USW-Flex",
                            url: "https://store.ui.com/us/en/collections/unifi-switching-utility-indoor-outdoor/products/usw-flex",
                            connection: {
                              type: "ethernet",
                              location: "buried",
                            },
                            links: [
                              {
                                type: "camera",
                                name: "Wolf Den 2",
                                model: "AXIS P1455-LE (Fixed)",
                                url: "https://help.axis.com/en-us/axis-p1455-le",
                                connection: {
                                  type: "ethernet",
                                  location: "wall",
                                },
                              },
                              {
                                type: "accessPoint",
                                name: "Wolf Deck",
                                model: "Ubiquiti UAP-AC-M",
                                url: "https://store.ui.com/us/en/collections/unifi-wifi-outdoor-long-range/products/uap-ac-mesh",
                                connection: {
                                  type: "ethernet",
                                  location: "wall",
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "switch",
                    name: "Marmoset",
                    model: "Ubiquiti USW-24-PoE",
                    url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-24-poe",
                    connection: { type: "ethernet", location: "buried" },
                    links: [
                      {
                        type: "camera",
                        name: "Marmoset Outside",
                        model: "AXIS M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Marmoset Inside",
                        model: "AXIS M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "accessPoint",
                        name: "Marmoset",
                        model: "Ubiquiti U6-Mesh",
                        url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/u6-mesh",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "interface",
                        name: "Marmoset Audio I/O",
                        model: "AXIS D3110 Connectivity Hub",
                        url: "https://www.axis.com/products/axis-d3110-connectivity-hub",
                        connection: { type: "ethernet", location: "wall" },
                        links: [
                          {
                            type: "microphone",
                            name: "Marmoset Microphone",
                            model: "AXIS TU1001-VE",
                            url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                            connection: { type: "ethernet", location: "wall" },
                          },
                        ],
                      },
                      {
                        type: "camera",
                        name: "Emu",
                        model: "AXIS P5676-LE (PTZ)",
                        url: "https://www.axis.com/products/axis-p5676-le",
                        connection: { type: "ethernet", location: "buried" },
                      },
                    ],
                  },
                  {
                    type: "converter",
                    name: "Fox",
                    model: "FS UMC-1F1T",
                    url: "https://www.fs.com/products/101472.html",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "switch",
                        name: "Fox",
                        model: "Ubiquiti US-8-150W",
                        url: "https://store.ui.com/us/en/pro/category/switching-utility/products/us-8-150w",
                        connection: { type: "fiber", location: "buried" },
                        links: [
                          {
                            type: "camera",
                            name: "Fox",
                            model: "AXIS M5525-E (PTZ)",
                            url: "https://www.axis.com/products/axis-m5525-e",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "camera",
                            name: "Fox Corner",
                            model: "AXIS M2036-LE (Fixed)",
                            url: "https://www.axis.com/products/axis-m2036-le",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "camera",
                            name: "Fox Den",
                            model: "AXIS P3268-LV (Fixed)",
                            url: "https://www.axis.com/products/axis-p3268-lv",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "accessPoint",
                            name: "Fox",
                            model: "Ubiquiti UAP-AC-M",
                            url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/uap-ac-mesh",
                            connection: { type: "ethernet", location: "wall" },
                          },
                          {
                            type: "interface",
                            name: "Fox Audio I/O",
                            model: "AXIS P8221 I/O Audio Module",
                            url: "https://www.axis.com/products/axis-p8221-io-audio-module/support",
                            connection: { type: "ethernet", location: "wall" },
                            links: [
                              {
                                type: "microphone",
                                name: "Fox Microphone",
                                model: "AXIS TU1001-VE",
                                url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                                connection: {
                                  type: "ethernet",
                                  location: "wall",
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export default data;
