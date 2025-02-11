import { type ReactNode } from "react";
import { type ImageProps } from "next/image";

import Heading from "@/components/content/Heading";

import filing2021Pdf from "@/assets/filings/990-2021.pdf";
import filing2022Pdf from "@/assets/filings/990-2022.pdf";
import filing2023Pdf from "@/assets/filings/990-2023.pdf";

import report2021Image from "@/assets/reports/2021.svg";
import report2022Image from "@/assets/reports/2022.svg";
import report2023Image from "@/assets/reports/2023.svg";

export type Report = {
  year: number;
  image: ImageProps["src"];
  alt: ReactNode;
  filing: string;
};

const reports = [
  {
    year: 2021,
    image: report2021Image,
    alt: (
      <>
        <div>
          <Heading level={2}>Viewer Demographics</Heading>

          <p>
            Alveus has the unique ability to reach viewers across the world
            virtually. While educating primarily U.S. viewers, our reach is
            gradually expanding worldwide.
          </p>

          <p>
            Twitch&apos;s user demographic is 41% ages 16-24 and 32% ages 25-34.
            With Twitch being our main platform, we have the opportunity to
            reach an audience of budding consumers. This next generation will
            determine the future for our planet.
          </p>

          {/* TODO: These values are based on the pixel width of the graph -- would be great to get the original numbers */}
          {/* <div className="flex flex-wrap justify-between gap-8">
            <dl>
              <dt className="mt-2 font-bold">United States</dt>
              <dd>695,550</dd>

              <dt className="mt-2 font-bold">Canada</dt>
              <dd>110,650</dd>

              <dt className="mt-2 font-bold">United Kingdom</dt>
              <dd>110,650</dd>

              <dt className="mt-2 font-bold">Germany</dt>
              <dd>94,850</dd>

              <dt className="mt-2 font-bold">Sweden</dt>
              <dd>47,400</dd>

              <dt className="mt-2 font-bold">Norway</dt>
              <dd>31,600</dd>

              <dt className="mt-2 font-bold">Brazil</dt>
              <dd>15,800</dd>

              <dt className="mt-2 font-bold">India</dt>
              <dd>15,800</dd>

              <dt className="mt-2 font-bold">France</dt>
              <dd>15,800</dd>

              <dt className="mt-2 font-bold">Portugal</dt>
              <dd>15,800</dd>
            </dl>

            <dl>
              <dt className="mt-2 font-bold">Male</dt>
              <dd>64.2%</dd>

              <dt className="mt-2 font-bold">Female</dt>
              <dd>37.6%</dd>
            </dl>
          </div> */}

          <p>
            Alveus has been steadily growing platforms across all social media.
            With larger followings, we are able to educate a wider and more
            diverse online audience.
          </p>

          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-start">Platform</th>
                <th className="text-start">2021</th>
                <th className="text-start">2022</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Twitch</td>
                <td>19,575</td>
                <td>68,600</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td>33,742</td>
                <td>47,000</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td>0</td>
                <td>25,400</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td>27,800</td>
                <td>41,800</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td>55,219</td>
                <td>67,700</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <Heading level={2}>Financial Report</Heading>

          <p>
            In 2021, Alveus raised a total of $763,380 USD due to generous
            support in the form of donations. Alveus had a total of $144,411.80
            in expenses in 2021. An additional $297,197.17 was dedicated to
            enclosures and infrastructure.
          </p>

          <p>
            Note: 2022 financials have not yet been released at this time. A
            2022 report will be created and released in 2023.
          </p>

          <p>
            In 2021, the majority (67.30%) of funds were dedicated to
            development of the facility. This included fencing, enclosure
            builds, interior renovations of buildings, and more. Operating
            expenses included the salary of one staff member (Ella Rocks, Animal
            Care Coordinator) in addition to general animal care costs.
          </p>

          <dl>
            <dt className="mt-2 font-bold">Construction</dt>
            <dd>67.30%</dd>

            <dt className="mt-2 font-bold">Operating</dt>
            <dd>17.79%</dd>

            <dt className="mt-2 font-bold">Fundraising</dt>
            <dd>8.46%</dd>

            <dt className="mt-2 font-bold">Management</dt>
            <dd>6.45%</dd>
          </dl>
        </div>

        <div className="space-y-4">
          <Heading level={2}>Continuing Our Mission</Heading>

          <p>
            The mission of Alveus is to inspire online audiences to engage in
            conservation efforts. We do this by nurturing a connection between
            viewers and our animal ambassadors so that they learn to care about
            their species.
          </p>

          <p>
            With your continued support, we are able to remain a powerful force
            for conservation while providing enriched and comfortable lives for
            our animal ambassadors.
          </p>

          <p>
            <strong>Thank you.</strong>
          </p>
        </div>
      </>
    ),
    filing: filing2021Pdf,
  },
  {
    year: 2022,
    image: report2022Image,
    alt: (
      <>
        <div>
          <Heading level={2}>Followers</Heading>

          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-start">Platform</th>
                <th className="text-start">Start 2022</th>
                <th className="text-start">End 2022</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Twitch</td>
                <td>19,575</td>
                <td>68,600</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td>33,742</td>
                <td>47,000</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td>0</td>
                <td>25,400</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td>27,800</td>
                <td>41,800</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td>55,219</td>
                <td>67,700</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <Heading level={2}>Twitch Demographics</Heading>

          <div className="flex flex-wrap justify-between gap-8">
            <dl>
              <dt className="mt-2 font-bold">Male</dt>
              <dd>78.36%</dd>

              <dt className="mt-2 font-bold">Female</dt>
              <dd>19.64%</dd>

              <dt className="mt-2 font-bold">Other</dt>
              <dd>2%</dd>
            </dl>

            <dl>
              <dt className="mt-2 font-bold">18-24</dt>
              <dd>35.85%</dd>

              <dt className="mt-2 font-bold">25-34</dt>
              <dd>32.14%</dd>

              <dt className="mt-2 font-bold">35-44</dt>
              <dd>15.33%</dd>

              <dt className="mt-2 font-bold">45-54</dt>
              <dd>8.62%</dd>

              <dt className="mt-2 font-bold">55-64</dt>
              <dd>4.97%</dd>
            </dl>

            <dl>
              <dt className="mt-2 font-bold">USA</dt>
              <dd>20.48%</dd>

              <dt className="mt-2 font-bold">Germany</dt>
              <dd>6.54%</dd>

              <dt className="mt-2 font-bold">South Korea</dt>
              <dd>5.09%</dd>

              <dt className="mt-2 font-bold">Russia</dt>
              <dd>4.7%</dd>

              <dt className="mt-2 font-bold">France</dt>
              <dd>4.27%</dd>

              <dt className="mt-2 font-bold">Others</dt>
              <dd>58.95%</dd>
            </dl>
          </div>

          <div className="flex flex-wrap justify-between gap-8">
            <Heading level={3} className="text-xl">
              50.3 million minutes watched
            </Heading>
            <Heading level={3} className="text-xl">
              2.65 million live views
            </Heading>
            <Heading level={3} className="text-xl">
              18,689 peak viewership
            </Heading>
          </div>
        </div>

        <div>
          <Heading level={2}>Financial Report</Heading>

          <table className="w-full table-auto">
            <tbody>
              <tr>
                <td>
                  <strong>Total Income</strong>
                </td>
                <td>
                  <strong>300,066.79</strong>
                </td>
              </tr>
              <tr>
                <td>Donations and Grants</td>
                <td>266,585.66</td>
              </tr>
              <tr>
                <td>Merch</td>
                <td>33,481.13</td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Expenses</strong>
                </td>
                <td>
                  <strong>285,838.93</strong>
                </td>
              </tr>
              <tr>
                <td>Operational Expenses</td>
                <td>32,679.86</td>
              </tr>
              <tr>
                <td>Advertising Expense</td>
                <td>154.61</td>
              </tr>
              <tr>
                <td>Fundraising Expense</td>
                <td>4,218.80</td>
              </tr>
              <tr>
                <td>Salary Expense</td>
                <td>121,240.94</td>
              </tr>
              <tr>
                <td>Insurance Expense</td>
                <td>16,429.08</td>
              </tr>
              <tr>
                <td>Repairs and Maintenance Expense</td>
                <td>38,792.41</td>
              </tr>
              <tr>
                <td>Meals &amp; Entertainment</td>
                <td>1,344.43</td>
              </tr>
              <tr>
                <td>Office Supplies &amp; Software Expense</td>
                <td>5,551.98</td>
              </tr>
              <tr>
                <td>Other Income &amp; Expenses</td>
                <td>3,318.66</td>
              </tr>
              <tr>
                <td>Tax Expense</td>
                <td>147</td>
              </tr>
              <tr>
                <td>Depreciation</td>
                <td>10,297.08</td>
              </tr>
              <tr>
                <td>Utilities Expense</td>
                <td>9,516.09</td>
              </tr>
              <tr>
                <td>Travel Expense</td>
                <td>3,229.19</td>
              </tr>
              <tr>
                <td>Contractor Expense</td>
                <td>15,512.46</td>
              </tr>
              <tr>
                <td>Streaming Expense</td>
                <td>17,024.54</td>
              </tr>
              <tr>
                <td>Legal &amp; Professional Fees</td>
                <td>6,381.80</td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Net Income</strong>
                </td>
                <td>
                  <strong>14,227.86</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Assets</strong>
                </td>
                <td>
                  <strong>621,387.23</strong>
                </td>
              </tr>
              <tr>
                <td>Total Current Assets - Cash</td>
                <td>117,763.40</td>
              </tr>
              <tr>
                <td>Total Fixed Assets</td>
                <td>503,623.83</td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Liabilities</strong>
                </td>
                <td>
                  <strong>677.99</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Equity - Retained Earnings</strong>
                </td>
                <td>
                  <strong>620,709.24</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Liabilities &amp; Equity</strong>
                </td>
                <td>
                  <strong>621,387.23</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <Heading level={2}>Continuing Our Mission</Heading>

          <p>
            The mission of Alveus is to inspire online audiences to engage in
            conservation efforts. We do this by nurturing a connection between
            viewers and our animal ambassadors so that they learn to care about
            their species.
          </p>

          <p>
            With your continued support, we are able to remain a powerful force
            for conservation while providing enriched and comfortable lives for
            our animal ambassadors.
          </p>

          <p>
            <strong>Thank you.</strong>
          </p>
        </div>
      </>
    ),
    filing: filing2022Pdf,
  },
  {
    year: 2023,
    image: report2023Image,
    alt: (
      <>
        <div>
          <Heading level={2}>Followers</Heading>

          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-start">Platform</th>
                <th className="text-start">Start 2023</th>
                <th className="text-start">End 2023</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Twitch</td>
                <td>68,600</td>
                <td>144,000</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td>47,000</td>
                <td>96,000</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td>25,400</td>
                <td>197,000</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td>41,800</td>
                <td>127,500</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td>67,700</td>
                <td>81,650</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <Heading level={3} className="text-xl">
            319 million minutes watched on Twitch by the end of 2023
          </Heading>
        </div>

        <div>
          <Heading level={2}>Financial Report</Heading>

          <table className="w-full table-auto">
            <tbody>
              <tr>
                <td>
                  <strong>Total Income</strong>
                </td>
                <td>
                  <strong>891,597.46</strong>
                </td>
              </tr>
              <tr>
                <td>Income</td>
                <td>723,219.83</td>
              </tr>
              <tr>
                <td>Sponsors</td>
                <td>109,335.46</td>
              </tr>
              <tr>
                <td>Sales of Merchandise</td>
                <td>59,041.90</td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Expenses</strong>
                </td>
                <td>
                  <strong>570,027.28</strong>
                </td>
              </tr>
              <tr>
                <td>Operational Expenses</td>
                <td>90,618.626</td>
              </tr>
              <tr>
                <td>Advertising Expense</td>
                <td>0.00</td>
              </tr>
              <tr>
                <td>Fundraising Expense</td>
                <td>10,336.05</td>
              </tr>
              <tr>
                <td>Salary Expense</td>
                <td>243,358.62</td>
              </tr>
              <tr>
                <td>Insurance Expense</td>
                <td>22,168.55</td>
              </tr>
              <tr>
                <td>Repairs and Maintenance</td>
                <td>52,267.97</td>
              </tr>
              <tr>
                <td>Meals &amp; Entertainment</td>
                <td>5,784.11</td>
              </tr>
              <tr>
                <td>Office Supplies &amp; Software</td>
                <td>11,498.69</td>
              </tr>
              <tr>
                <td>Tax Expense</td>
                <td>4,982.55</td>
              </tr>
              <tr>
                <td>Depreciation</td>
                <td>19,857.56</td>
              </tr>
              <tr>
                <td>Utilities Expense</td>
                <td>7,413.45</td>
              </tr>
              <tr>
                <td>Travel Expense</td>
                <td>5,090.08</td>
              </tr>
              <tr>
                <td>Contractor Expense</td>
                <td>69,597.38</td>
              </tr>
              <tr>
                <td>Streaming Expense</td>
                <td>25,196.07</td>
              </tr>
              <tr>
                <td>Legal &amp; Professional Fees</td>
                <td>1,857.58</td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Net Income</strong>
                </td>
                <td>
                  <strong>321,570.18</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr>
                <td>
                  <strong>Total Assets</strong>
                </td>
                <td>
                  <strong>944,394.94</strong>
                </td>
              </tr>
              <tr>
                <td>Fixed Assets</td>
                <td>542,780.17</td>
              </tr>
              <tr>
                <td>Current Assets</td>
                <td>401,614.77</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <Heading level={2}>Continuing Our Mission</Heading>

          <p>
            The mission of Alveus is to inspire online audiences to engage in
            conservation efforts. Throughout 2023, we furthered this mission by
            continuing to rescue animal ambassadors and curate educational
            programs involving them. We also hosted 20 content collaborations
            with creators from across the United States. Through these
            collaborations, we were able to spread even more conservation
            messaging to audiences across the globe.
          </p>

          <p>
            With your continued support, we are able to continue giving a voice
            to vulnerable species around the globe while providing excellent
            quality of care for our animal ambassadors.
          </p>
        </div>
      </>
    ),
    filing: filing2023Pdf,
  },
] as const satisfies Report[];

export const reportYears = reports
  .map((report) => report.year)
  .toSorted((a, b) => b - a);

export type ReportYear = (typeof reportYears)[number];

export const isReportYear = (year: unknown): year is ReportYear =>
  typeof year === "number" && reports.some((report) => report.year === year);

export const getReport = (year: ReportYear): Report =>
  reports.find((report) => report.year === year)!;
