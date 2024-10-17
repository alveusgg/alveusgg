import { type NextPage } from "next";
import Image from "next/image";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Button from "@/components/content/Button";
import Meta from "@/components/content/Meta";

import report2023Image from "@/assets/reports/2023.svg";

const AboutAnnualReport2023Page: NextPage = () => {
  return (
    <>
      <Meta
        title="2023 | Annual Reports"
        description="Read through the 2023 Annual Report published by Alveus."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>2023 Annual Report</Heading>
        <Button href="/about/annual-reports" dark>
          Explore other reports
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Image
          src={report2023Image}
          quality={100}
          className="mx-auto h-auto w-full max-w-3xl"
          alt="Report graphic"
          aria-describedby="report"
        />

        <div className="sr-only space-y-8" id="report">
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
              conservation efforts. Throughout 2023, we furthered this mission
              by continuing to rescue animal ambassadors and curate educational
              programs involving them. We also hosted 20 content collaborations
              with creators from across the United States. Through these
              collaborations, we were able to spread even more conservation
              messaging to audiences across the globe.
            </p>

            <p>
              With your continued support, we are able to continue giving a
              voice to vulnerable species around the globe while providing
              excellent quality of care for our animal ambassadors.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
};

export default AboutAnnualReport2023Page;
