import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

import report2022Image from "@/assets/reports/2022.svg";

const AboutAnnualReport2022Page: NextPage = () => {
  return (
    <>
      <Meta
        title="2022 | Annual Reports"
        description="Read through the 2022 Annual Report published by Alveus."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>2022 Annual Report</Heading>
        <Link
          href="/about/annual-reports"
          className="text-md rounded-full border-2 border-white px-4 py-2 transition-colors hover:border-alveus-tan hover:bg-alveus-tan hover:text-alveus-green"
        >
          Explore other reports
        </Link>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Image
          src={report2022Image}
          quality={100}
          alt=""
          className="mx-auto h-auto w-full max-w-3xl"
        />

        <div className="sr-only">
          <Heading level={2} className="mt-8">
            Followers
          </Heading>

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

          <Heading level={2} className="mt-8">
            Twitch Demographics
          </Heading>

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

          <Heading level={2} className="mt-8">
            Financial Report
          </Heading>

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

          <Heading level={2} className="mt-8">
            Continuing Our Mission
          </Heading>

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
      </Section>
    </>
  );
};

export default AboutAnnualReport2022Page;
