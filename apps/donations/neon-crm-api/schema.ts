import { z } from "zod";

const idMin = 0;
const idMax = 20;

const nameMin = 0;
const nameMax = 255;

const Status = z.enum(["ACTIVE", "INACTIVE"]);

const YesNoBoolean = z.enum(["Yes", "No"]).transform((val) => val === "Yes");

const ConsentStatus = z.enum(["GIVEN", "DECLINED", "NOT_ASKED"]);

const DataType = z.enum([
  "Whole_Number",
  "Decimal",
  "Currency",
  "Date",
  "Time",
  "Boolean",
  "Text",
  "Email",
  "Phone",
  "Area_Code",
  "Name",
  "Integer",
  "Float",
  "Amount",
]);

const Component = z.enum([
  "Account",
  "Donation",
  "Event",
  "Attendee",
  "Individual",
  "Company",
  "Activity",
  "Membership",
  "Product",
  "Prospect",
  "Grant",
]);

const DisplayType = z.enum([
  "Checkbox",
  "Dropdown",
  "OneLineText",
  "MultiLineText",
  "Password",
  "Radio",
  "File",
  "Account",
]);

const PhoneType = z.enum(["Home", "Work", "Mobile", "Other"]);

const DateTimeSchema = z.iso
  .datetime({ offset: true })
  .transform((val) => new Date(val));

const DateSchema = z.iso.date().transform((val) => new Date(val));

export type RecordId = z.input<typeof RecordId>;

export const RecordId = z
  .string()
  .min(idMin)
  .max(idMax)
  .refine(
    (val) => {
      const num = Number(val);
      return Number.isInteger(num) && num >= 0;
    },
    {
      message: "Must be a stringified, positive integer",
    },
  );

export type RecordName = z.input<typeof RecordName>;

export const RecordName = z.string().min(nameMin).max(nameMax);

const NameValuePair = z.object({
  name: RecordName.nullable(),
  value: z.string().nullable(),
});

const IdNamePairBase = z.object({
  id: RecordId.nullable(),
  name: RecordName.nullable(),
});
const IdNamePair = IdNamePairBase.extend({ status: Status.nullable() });

const CodeNamePairBase = z.object({
  code: z.string(),
  name: RecordName,
});
const CodeNamePair = CodeNamePairBase.extend({ status: Status.nullable() });

const CustomFieldOptionInput = z.object({
  id: RecordId.optional(),
  name: RecordName.optional(),
  visibleOnPublicForms: z.boolean().optional(),
  visibleOnConstituentForms: z.boolean().optional(),
});

const CustomFieldOptionResponse = z.object({
  id: RecordId,
  name: RecordName,
  visibleOnPublicForms: z.boolean(),
  visibleOnConstituentForms: z.boolean(),
});

const AccountType = z.enum(["Any", "Individual", "Company"]);

const AccountSettings = z.object({ accountType: AccountType.optional() });

export type UpdateCustomFieldInput = z.input<typeof UpdateCustomFieldBody>;

export const UpdateCustomFieldBody = z.object({
  name: RecordName,
  status: Status,
  displayName: z.string(),
  displayType: DisplayType,
  component: Component,

  groupId: RecordId.optional(),
  dataType: DataType.optional(),
  constituentReadOnly: z.boolean().optional(),
  optionValues: z.array(CustomFieldOptionInput).optional(),
  accountSettings: AccountSettings.optional(),
});

export const CustomFieldResponse = z.object({
  id: RecordId,
  name: RecordName,
  status: Status,
  displayName: z.string(),
  groupId: RecordId.nullable(),
  displayType: DisplayType,
  dataType: DataType.nullable(),
  constituentReadOnly: z.boolean(),
  component: Component,
  optionValues: z.array(CustomFieldOptionResponse).nullable(),
  accountSettings: AccountSettings.nullable(),
});

const CustomFieldData = z.union([
  IdNamePairBase.extend({ optionValues: z.array(IdNamePairBase) }),
  IdNamePairBase.extend({ value: z.string() }),
]);

const Timestamps = z.object({
  createdBy: z.string(),
  createdDateTime: DateTimeSchema,
  lastModifiedBy: z.string(),
  lastModifiedDateTime: DateTimeSchema,
});

const webhookPayloadBase = {
  eventTimestamp: DateTimeSchema,
  organizationId: z.string(),
  customParameters: z.record(z.string(), z.string()).optional(),
};

export type DonationWebhookPayload = z.output<typeof DonationWebhookPayload>;

export const DonationWebhookPayload = z.object({
  ...webhookPayloadBase,
  eventTrigger: z.literal("createDonation"),
  data: z.object({
    id: RecordId,
    accountId: RecordId,
    amount: z.number().positive(),
    campaign: IdNamePairBase,
    fund: IdNamePairBase,
    timestamps: Timestamps,
    date: DateSchema,
    anonymousType: YesNoBoolean,
    donationCustomFields: z.array(CustomFieldData).optional(),
    donorCoveredFeeFlag: z.boolean(),
    payLater: z.boolean(),
  }),
});

export const WebhookPayload = z.discriminatedUnion("eventTrigger", [
  DonationWebhookPayload,
]);

const AddressBase = z.object({
  addressId: RecordId,
  type: IdNamePair,
  addressLine1: z.string(),
  addressLine2: z.string(),
  addressLine3: z.string(),
  addressLine4: z.string(),
  city: z.string(),
  stateProvince: CodeNamePair.nullable(),
  country: IdNamePair.nullable(),
  territory: z.string().nullable(),
  county: z.string().nullable(),
  zipCode: z.string().nullable(),
  zipCodeSuffix: z.string().nullable(),
  phone1: z.string().nullable(),
  phone1Type: PhoneType.nullable(),
  phone2: z.string().nullable(),
  phone2Type: PhoneType.nullable(),
  phone3: z.string().nullable(),
  phone3Type: PhoneType.nullable(),
  fax: z.string().nullable(),
  faxType: PhoneType.nullable(),
});

const ShippingAddress = AddressBase.extend({
  shippingCompanyName: z.string(),
  shippingDeliverTo: z.string(),
});

const Address = AddressBase.extend({
  startDate: DateSchema.nullable(),
  endDate: DateSchema.nullable(),
  isPrimaryAddress: z.boolean(),
  validAddress: z.boolean(),
});

const DateOfBirth = z.object({
  day: z.coerce.number().int().min(1).max(31).nullable(),
  month: z.coerce.number().int().min(1).max(12).nullable(),
  year: z.coerce
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear())
    .nullable(),
});

const Contact = z.object({
  accountId: RecordId.nullable(),
  contactId: RecordId.nullable(),
  firstName: z.string().nullable(),
  middleName: z.string().nullable(),
  lastName: z.string().nullable(),
  prefix: z.string().nullable(),
  suffix: z.string().nullable(),
  salutation: z.string().nullable(),
  preferredName: z.string().nullable(),
  dob: DateOfBirth.nullable(),
  gender: CodeNamePair.nullable(),
  email1: z.string().nullable(),
  email2: z.string().nullable(),
  email3: z.string().nullable(),
  deceased: z.boolean(),
  department: z.string().nullable(),
  title: z.string().nullable(),
  primaryContact: z.boolean().nullable(),
  currentEmployer: z.boolean().nullable(),
  startDate: DateTimeSchema.nullable(),
  endDate: DateTimeSchema.nullable(),
  addresses: z.array(Address),
});

const GenerosityIndicator = z.object({
  indicator: z.number(),
  affinity: z.number().int(),
  recency: z.number().int(),
  frequency: z.number().int(),
  monetaryValue: z.number().int(),
});

const SharedAccountData = z.object({
  accountId: RecordId,
  noSolicitation: z.boolean(),
  login: z
    .object({
      username: z.string(),
    })
    .nullable(),
  url: z.string().nullable(),
  timestamps: Timestamps,
  consent: z
    .object({
      email: ConsentStatus.nullable(),
      phone: ConsentStatus.nullable(),
      mail: ConsentStatus.nullable(),
      sms: ConsentStatus.nullable(),
      dataSharing: ConsentStatus.nullable(),
    })
    .nullable(),
  accountCustomFields: z.array(CustomFieldData),
  source: IdNamePair.nullable(),
  primaryContact: Contact,
  sendSystemEmail: z.boolean(),
  email1OptOut: z.boolean().nullable(),
  origin: z
    .object({
      originDetail: z.string(),
      originCategory: z.string(),
    })
    .nullable(),
  accountCurrentMembershipStatus: z.string().nullable(),
  generosityIndicator: GenerosityIndicator.nullable(),
  sendTextOptIn: z.boolean(),
  smsNumber: z.string(),
  restrictFromWindfallSync: z.boolean(),
});

const IndividualAccount = SharedAccountData.extend({
  company: IdNamePair.nullable(),
  facebookPage: z.string().nullable(),
  instagramPage: z.string().nullable(),
  linkedinPage: z.string().nullable(),
  twitterPage: z.string().nullable(),
  individualTypes: z.array(IdNamePair),
});

const CompanyAccount = SharedAccountData.extend({
  name: z.string(),
  primaryContactAccountId: RecordId.nullable(),
  companyTypes: z.array(IdNamePair),
  shippingAddresses: z.array(ShippingAddress),
});

export type AccountResponse = z.output<typeof AccountResponse>;
export const AccountResponse = z.object({
  individualAccount: IndividualAccount.nullable(),
  companyAccount: CompanyAccount.nullable(),
});

export type CreateWebhookInput = z.input<typeof CreateWebhookInputBody>;

export const CreateWebhookInputBody = z.object({
  name: RecordName,
  url: z.httpUrl(),
  trigger: z.enum(["CREATE_DONATION"]),
  contentType: z.literal("application/json"),
  triggerSelfImport: z.boolean(),
  httpBasic: z.object({
    userName: z.string(),
    password: z.string(),
  }),
  customParameters: z.array(NameValuePair),
});

export const CreateWebhookResponse = z.object({
  id: RecordId,
});

export type WebhookResponse = z.output<typeof WebhookResponse>;
export const WebhookResponse = z.object({
  id: RecordId,
  name: RecordName,
  url: z.httpUrl(),
  trigger: z.enum(["CREATE_DONATION"]),
  contentType: z.string(),
  triggerSelfImport: z.boolean(),
  httpBasic: z.object({
    userName: z.string(),
  }),
  customParameters: z.array(NameValuePair).nullable(),
});

export type WebhooksResponse = z.output<typeof WebhooksResponse>;
export const WebhooksResponse = z.array(WebhookResponse);
