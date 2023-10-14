type NetworkConnectionCore = {
  type: string;
};

type NetworkConnectionWired = NetworkConnectionCore & {
  type: "ethernet" | "fiber";
  location: "buried" | "overhead" | "wall";
  accessories?: { name: string; model: string; url: string }[];
};

type NetworkConnectionWireless = NetworkConnectionCore & {
  type: "wifi";
};

type NetworkConnection = NetworkConnectionWired | NetworkConnectionWireless;

type NetworkItemCore = {
  type: string;
  name: string;
  model: string;
  url?: string;
  connection: NetworkConnection;
};

type NetworkItemSwitch = NetworkItemCore & {
  type: "switch" | "converter"  | "interface";
  links: NetworkItem[];
};

type NetworkItemCamera = NetworkItemCore & {
  type: "camera" | "microphone" | "speaker";
};

type NetworkItemAccessPoint = NetworkItemCore & {
  type: "accessPoint";
  links?: NetworkItem[];
};

export type NetworkItem =
  | NetworkItemSwitch
  | NetworkItemCamera
  | NetworkItemAccessPoint;

const data: NetworkItem[] = [
  {
    type: "switch",
    name: "Studio",
    model: "Ubiquiti USW-24-PoE",
    url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-24-poe",
    connection: { type: "ethernet", location: "wall" },
    links: [
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
            model: "AXIS M5075-G (PTZ)",
            url: "https://www.axis.com/products/axis-m5075-g",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Noodle Hide",
            model: "AXIS P1275 (Fixed)",
            url: "https://www.axis.com/products/axis-p1275",
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
            type: "camera",
            name: "Marty",
            model: "AXIS M5075-G (PTZ)",
            url: "https://www.axis.com/products/axis-m5075-g",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Barbara / Baked Bean",
            model: "AXIS M5075-G (PTZ)",
            url: "https://www.axis.com/products/axis-m5075-g",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "switch",
            name: "Critter Cave",
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
        name: "Ella's House",
        model: "Ubiquiti USW-16-PoE",
        url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-16-poe",
        connection: { type: "ethernet", location: "buried" },
        links: [
          {
            type: "accessPoint",
            name: "Ella's House",
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
          {
            type: "switch",
            name: "Training Center",
            model: "Ubiquiti USW-Lite-8-PoE",
            url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
            connection: { type: "ethernet", location: "overhead" },
            links: [
              {
                type: "camera",
                name: "Training Center",
                model: "AXIS M5075-G (PTZ)",
                url: "https://www.axis.com/products/axis-m5075-g",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "accessPoint",
                name: "Pasture",
                model: "Ubiquiti UAP-AC-M-Pro",
                url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                connection: { type: "ethernet", location: "buried" },
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
                name: "Parrots",
                model: "Ubiquiti USW-Lite-8-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
                connection: { type: "ethernet", location: "wall" },
                links: [
                  {
                    type: "camera",
                    name: "Parrots",
                    model: "AXIS P5676-LE (PTZ)",
                    url: "https://www.axis.com/products/axis-p5676-le",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "interface",
                    name: "Parrots Audio I/O",
                    model: "AXIS P8221 I/O Audio Module",
                    url: "https://www.axis.com/products/axis-p8221-io-audio-module/support",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "microphone",
                        name: "Parrots Microphone",
                        model: "AXIS TU1001-VE",
                        url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                        connection: { type: "ethernet", location: "wall" },
                      },
                    ],
                  },
                  {
                    type: "speaker",
                    name: "Parrots Speaker",
                    model: "AXIS C1610-VE Network Sound Projector",
                    url: "https://www.axis.com/products/axis-c1610-ve",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "accessPoint",
                    name: "Parrots",
                    model: "Ubiquiti UAP-AC-M-Pro",
                    url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                    connection: { type: "ethernet", location: "wall" },
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
            name: "Power Distribution",
            model: "Ubiquiti USW-Lite-8-PoE",
            url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-8-poe",
            connection: { type: "ethernet", location: "buried" },
            links: [
              {
                type: "switch",
                name: "Crows",
                model: "Ubiquiti USW-Lite-16-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-utility/products/usw-lite-16-poe",
                connection: { type: "ethernet", location: "buried" },
                links: [
                  {
                    type: "camera",
                    name: "Crows Outside",
                    model: "AXIS M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Crows Inside",
                    model: "AXIS M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "interface",
                    name: "Crows Audio I/O",
                    model: "AXIS P8221 I/O Audio Module",
                    url: "https://www.axis.com/products/axis-p8221-io-audio-module/support",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "microphone",
                        name: "Crows Microphone",
                        model: "AXIS TU1001-VE",
                        url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                        connection: { type: "ethernet", location: "wall" },
                      },
                    ],
                  },
                  {
                    type: "accessPoint",
                    name: "Crows",
                    model: "Ubiquiti UAP-AC-M-Pro",
                    url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                    connection: { type: "ethernet", location: "wall" },
                  },
                ],
              },
              {
                type: "switch",
                name: "Marmosets",
                model: "Ubiquiti USW-24-PoE",
                url: "https://store.ui.com/us/en/pro/category/switching-standard/products/usw-24-poe",
                connection: { type: "ethernet", location: "buried" },
                links: [
                  {
                    type: "camera",
                    name: "Marmosets Outside",
                    model: "AXIS M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Marmosets Inside",
                    model: "AXIS M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "interface",
                    name: "Marmosets Audio I/O",
                    model: "AXIS D3110 Connectivity Hub",
                    url: "https://www.axis.com/products/axis-d3110-connectivity-hub",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "microphone",
                        name: "Marmosets Microphone",
                        model: "AXIS TU1001-VE",
                        url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                        connection: { type: "ethernet", location: "wall" },
                      },
                    ],
                  },
                  {
                    type: "accessPoint",
                    name: "Marmosets",
                    model: "Ubiquiti U6-Mesh",
                    url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/u6-mesh",
                    connection: { type: "ethernet", location: "wall" },
                  },
                ],
              },
              {
                type: "converter",
                name: "Foxes",
                model: "FS UMC-1F1T",
                url: "https://www.fs.com/products/101472.html",
                connection: { type: "ethernet", location: "wall" },
                links: [
                  {
                    type: "switch",
                    name: "Foxes",
                    model: "Ubiquiti US-8-150W",
                    url: "https://store.ui.com/us/en/pro/category/switching-utility/products/us-8-150w",
                    connection: { type: "fiber", location: "buried" },
                    links: [
                      {
                        type: "camera",
                        name: "Foxes",
                        model: "AXIS M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Foxes Corner",
                        model: "AXIS M2036-LE (Fixed)",
                        url: "https://www.axis.com/products/axis-m2036-le",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Foxes Den",
                        model: "AXIS P3268-LV (Fixed)",
                        url: "https://www.axis.com/products/axis-p3268-lv",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "interface",
                        name: "Foxes Audio I/O",
                        model: "AXIS P8221 I/O Audio Module",
                        url: "https://www.axis.com/products/axis-p8221-io-audio-module/support",
                        connection: { type: "ethernet", location: "wall" },
                        links: [
                          {
                            type: "microphone",
                            name: "Foxes Microphone",
                            model: "AXIS TU1001-VE",
                            url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                            connection: { type: "ethernet", location: "wall" },
                          },
                        ],
                      },
                      {
                        type: "accessPoint",
                        name: "Foxes",
                        model: "Ubiquiti UAP-AC-M",
                        url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/uap-ac-mesh",
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
    ],
  },
];

export default data;
