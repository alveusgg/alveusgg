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
  url: string;
  connection: NetworkConnection;
};

type NetworkItemSwitch = NetworkItemCore & {
  type: "switch";
  links: NetworkItem[];
};

type NetworkItemCamera = NetworkItemCore & {
  type: "camera";
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
    url: "",
    connection: { type: "ethernet", location: "wall" },
    links: [
      {
        type: "accessPoint",
        name: "Studio",
        model: "Ubiquiti UAP-FlexHD",
        url: "",
        connection: { type: "ethernet", location: "wall" },
      },
      {
        type: "switch",
        name: "Reptile Room",
        model: "Ubiquiti USW-24-PoE",
        url: "",
        connection: { type: "ethernet", location: "wall" },
        links: [
          {
            type: "camera",
            name: "Noodle",
            model: "Axis M5075-G (PTZ)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Noodle Hide",
            model: "Axis P12 MkII (Fixed)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Georgie",
            model: "Axis M5075-G (PTZ)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Georgie Water",
            model: "Axis P12 MkII (Fixed)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Marty",
            model: "Axis M5075-G (PTZ)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "camera",
            name: "Barbara / Baked Bean",
            model: "Axis M5075-G (PTZ)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "switch",
            name: "Critter Cave",
            model: "Ubiquiti USW-Lite-8-PoE",
            url: "",
            connection: { type: "ethernet", location: "wall" },
            links: [
              {
                type: "camera",
                name: "Hank",
                model: "Axis M5075-G (PTZ)",
                url: "",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Hank Corner",
                model: "Axis M1065-LW (Fixed)",
                url: "",
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
        url: "",
        connection: { type: "ethernet", location: "buried" },
        links: [
          {
            type: "accessPoint",
            name: "Ella's House",
            model: "Ubiquiti UAP-FlexHD",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "accessPoint",
            name: "Area Wide",
            model: "Ubiquiti UAP-AC-M-Pro",
            url: "",
            connection: { type: "ethernet", location: "wall" },
            links: [
              {
                type: "accessPoint",
                name: "Pasture",
                model: "Ubiquiti UAP-AC-M-Pro",
                url: "",
                connection: { type: "wifi" },
              },
              {
                type: "accessPoint",
                name: "Parrots",
                model: "Ubiquiti UAP-AC-M-Pro",
                url: "",
                connection: { type: "wifi" },
                links: [
                  {
                    type: "switch",
                    name: "Parrots",
                    model: "Ubiquiti USW-Lite-8-PoE",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                    links: [
                      {
                        type: "camera",
                        name: "Parrots",
                        model: "Axis M5525-E (PTZ)",
                        url: "",
                        connection: { type: "ethernet", location: "wall" },
                      },
                      {
                        type: "camera",
                        name: "Parrots Audio",
                        model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                        url: "",
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
            name: "Pasture",
            model: "Ubiquiti USW-Lite-8-PoE",
            url: "",
            connection: { type: "fiber", location: "wall" },
            links: [
              {
                type: "camera",
                name: "Pasture",
                model: "Axis Q6135-LE (PTZ)",
                url: "",
                connection: { type: "ethernet", location: "wall" },
              },
              {
                type: "camera",
                name: "Pasture Audio",
                model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                url: "",
                connection: { type: "ethernet", location: "wall" },
              },
            ],
          },
        ],
      },
      {
        type: "switch",
        name: "Nutrition House",
        model: "Ubiquiti USW-24-PoE",
        url: "",
        connection: { type: "ethernet", location: "buried" },
        links: [
          {
            type: "camera",
            name: "Nutrition House",
            model: "OBSBOT Tiny 4K (PTZ)",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "accessPoint",
            name: "Nutrition House",
            model: "Ubiquiti UAP-FlexHD",
            url: "",
            connection: { type: "ethernet", location: "wall" },
          },
          {
            type: "switch",
            name: "Power Distribution",
            model: "Ubiquiti USW-Lite-8-PoE",
            url: "",
            connection: { type: "ethernet", location: "buried" },
            links: [
              {
                type: "switch",
                name: "Crows",
                model: "Ubiquiti USW-Lite-16-PoE",
                url: "",
                connection: { type: "ethernet", location: "buried" },
                links: [
                  {
                    type: "camera",
                    name: "Crows Outside",
                    model: "Axis M5525-E (PTZ)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Crows Inside",
                    model: "Axis M5525-E (PTZ)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Crows Audio",
                    model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "accessPoint",
                    name: "Crows",
                    model: "Ubiquiti UAP-AC-M-Pro",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                ],
              },
              {
                type: "switch",
                name: "Marmosets",
                model: "Ubiquiti USW-24-PoE",
                url: "",
                connection: { type: "ethernet", location: "buried" },
                links: [
                  {
                    type: "camera",
                    name: "Marmosets Outside",
                    model: "Axis M5525-E (PTZ)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Marmosets Inside",
                    model: "Axis M5075-G (PTZ)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Marmosets Audio",
                    model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "accessPoint",
                    name: "Marmosets",
                    model: "Ubiquiti U6-Mesh",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                ],
              },
              {
                type: "switch",
                name: "Foxes",
                model: "Ubiquiti US-8-150W",
                url: "",
                connection: { type: "fiber", location: "buried" },
                links: [
                  {
                    type: "camera",
                    name: "Foxes",
                    model: "Axis M5525-E (PTZ)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Foxes Corner",
                    model: "Axis M2036-LE (Fixed)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Foxes Den",
                    model: "Axis P3268-LV (Fixed)",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "camera",
                    name: "Foxes Audio",
                    model: "Axis TU1001-VE w/ Axis P8221 I/O Audio Module",
                    url: "",
                    connection: { type: "ethernet", location: "wall" },
                  },
                  {
                    type: "accessPoint",
                    name: "Foxes",
                    model: "Ubiquiti UAP-AC-M",
                    url: "",
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
];

export default data;
