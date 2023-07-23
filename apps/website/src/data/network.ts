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
  type: "switch" | "converter";
  links: NetworkItem[];
};

type NetworkItemCamera = NetworkItemCore & {
  type: "camera" | "microphone";
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
            model: "Axis M5075-G (PTZ)",
            url: "https://www.axis.com/products/axis-m5075-g",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Noodle Hide",
            model: "Axis P1275 (Fixed)",
            url: "https://www.axis.com/products/axis-p1275",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Georgie",
            model: "Axis M5075-G (PTZ)",
            url: "https://www.axis.com/products/axis-m5075-g",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Georgie Water",
            model: "Axis P1245 (Fixed)",
            url: "https://www.axis.com/products/axis-p1245",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Marty",
            model: "Axis M5075-G (PTZ)",
            url: "https://www.axis.com/products/axis-m5075-g",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Barbara / Baked Bean",
            model: "Axis M5075-G (PTZ)",
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
                model: "Axis M5075-G (PTZ)",
                url: "https://www.axis.com/products/axis-m5075-g",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Hank Corner",
                model: "Axis M1065-LW (Fixed)",
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
            links: [
              {
                type: "accessPoint",
                name: "Pasture",
                model: "Ubiquiti UAP-AC-M-Pro",
                url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
                connection: { type: "wifi" },
              },
              {
                type: "accessPoint",
                name: "Parrots",
                model: "Ubiquiti UAP-AC-M-Pro",
                url: "https://store.ui.com/us/en/pro/category/wiif-outdoor/products/unifi-ac-mesh-pro-ap",
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
                        model: "Axis M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "microphone",
                        name: "Parrots Audio",
                        model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
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
                    type: "camera",
                    name: "Pasture",
                    model: "Axis Q6135-LE (PTZ)",
                    url: "https://www.axis.com/products/axis-q6135-le",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "microphone",
                    name: "Pasture Audio",
                    model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
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
                    model: "Axis M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Crows Inside",
                    model: "Axis M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "microphone",
                    name: "Crows Audio",
                    model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                    url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                    connection: { type: "ethernet", location: "wall" },
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
                    model: "Axis M5525-E (PTZ)",
                    url: "https://www.axis.com/products/axis-m5525-e",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Marmosets Inside",
                    model: "Axis M5075-G (PTZ)",
                    url: "https://www.axis.com/products/axis-m5075-g",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "microphone",
                    name: "Marmosets Audio",
                    model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                    url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                    connection: { type: "ethernet", location: "wall" },
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
                        model: "Axis M5525-E (PTZ)",
                        url: "https://www.axis.com/products/axis-m5525-e",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Foxes Corner",
                        model: "Axis M2036-LE (Fixed)",
                        url: "https://www.axis.com/products/axis-m2036-le",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Foxes Den",
                        model: "Axis P3268-LV (Fixed)",
                        url: "https://www.axis.com/products/axis-p3268-lv",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "microphone",
                        name: "Foxes Audio",
                        model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                        url: "https://www.axis.com/products/axis-tu1001-ve-microphone",
                        connection: { type: "ethernet", location: "wall" },
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
