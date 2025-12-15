import { type ImageProps } from "next/image";
import { type ReactNode } from "react";

import Box from "@/components/content/Box";
import Heading from "@/components/content/Heading";

import filing2021Pdf from "@/assets/filings/990-2021.pdf";
import filing2022Pdf from "@/assets/filings/990-2022.pdf";
import filing2023Pdf from "@/assets/filings/990-2023.pdf";
import filing2024Pdf from "@/assets/filings/990-2024.pdf";
import report2021Image from "@/assets/reports/2021.svg";
import report2022Image from "@/assets/reports/2022.svg";
import report2023Image from "@/assets/reports/2023.svg";
import report2024Image from "@/assets/reports/2024.svg";

export type Report = {
  year: number;
  image: ImageProps["src"];
  alt: ReactNode;
  filing: string;
};

const tableClasses =
  "w-full table-auto [&_tbody]:rounded [&_tbody]:overflow-clip [&_td]:p-1 [&_tr]:odd:bg-alveus-tan/10";
const tableHeadClasses = "bg-alveus-green-900!";
const tableBreakClasses = "*:px-0! *:py-4! bg-transparent!";
const tableNumberClasses = "text-end tabular-nums";

const reports = [
  {
    year: 2021,
    image: report2021Image,
    alt: (
      <>
        <Box dark className="space-y-4">
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

          <table className={tableClasses}>
            <tbody>
              <tr>
                <td>Twitch</td>
                <td className={tableNumberClasses}>19,575</td>
                <td className={tableNumberClasses}>68,600</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td className={tableNumberClasses}>33,742</td>
                <td className={tableNumberClasses}>47,000</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td className={tableNumberClasses}>0</td>
                <td className={tableNumberClasses}>25,400</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td className={tableNumberClasses}>27,800</td>
                <td className={tableNumberClasses}>41,800</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td className={tableNumberClasses}>55,219</td>
                <td className={tableNumberClasses}>67,700</td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box dark>
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

          <dl className="flex flex-wrap gap-4">
            <div>
              <dt className="mt-2 font-bold">Construction</dt>
              <dd>67.30%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Operating</dt>
              <dd>17.79%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Fundraising</dt>
              <dd>8.46%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Management</dt>
              <dd>6.45%</dd>
            </div>
          </dl>
        </Box>

        <Box dark className="space-y-4">
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
        </Box>
      </>
    ),
    filing: filing2021Pdf,
  },
  {
    year: 2022,
    image: report2022Image,
    alt: (
      <>
        <Box dark>
          <Heading level={2}>Followers</Heading>

          <table className={tableClasses}>
            <tbody>
              <tr>
                <td>Twitch</td>
                <td className={tableNumberClasses}>19,575</td>
                <td className={tableNumberClasses}>68,600</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td className={tableNumberClasses}>33,742</td>
                <td className={tableNumberClasses}>47,000</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td className={tableNumberClasses}>0</td>
                <td className={tableNumberClasses}>25,400</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td className={tableNumberClasses}>27,800</td>
                <td className={tableNumberClasses}>41,800</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td className={tableNumberClasses}>55,219</td>
                <td className={tableNumberClasses}>67,700</td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box dark className="space-y-4">
          <Heading level={2}>Twitch Demographics</Heading>

          <dl className="flex flex-wrap gap-4">
            <div>
              <dt className="mt-2 font-bold">Male</dt>
              <dd>78.36%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Female</dt>
              <dd>19.64%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Other</dt>
              <dd>2%</dd>
            </div>
          </dl>

          <dl className="flex flex-wrap gap-4">
            <div>
              <dt className="mt-2 font-bold">18-24</dt>
              <dd>35.85%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">25-34</dt>
              <dd>32.14%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">35-44</dt>
              <dd>15.33%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">45-54</dt>
              <dd>8.62%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">55-64</dt>
              <dd>4.97%</dd>
            </div>
          </dl>

          <dl className="flex flex-wrap gap-4">
            <div>
              <dt className="mt-2 font-bold">USA</dt>
              <dd>20.48%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Germany</dt>
              <dd>6.54%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">South Korea</dt>
              <dd>5.09%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Russia</dt>
              <dd>4.7%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">France</dt>
              <dd>4.27%</dd>
            </div>

            <div>
              <dt className="mt-2 font-bold">Others</dt>
              <dd>58.95%</dd>
            </div>
          </dl>

          <div className="flex flex-wrap justify-between gap-8">
            <Heading level={-1} className="text-xl">
              50.3 million minutes watched
            </Heading>
            <Heading level={-1} className="text-xl">
              2.65 million live views
            </Heading>
            <Heading level={-1} className="text-xl">
              18,689 peak viewership
            </Heading>
          </div>
        </Box>

        <Box dark>
          <Heading level={2}>Financial Report</Heading>

          <table className={tableClasses}>
            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Income</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>300,066.79</strong>
                </td>
              </tr>
              <tr>
                <td>Donations and Grants</td>
                <td className={tableNumberClasses}>266,585.66</td>
              </tr>
              <tr>
                <td>Merch</td>
                <td className={tableNumberClasses}>33,481.13</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Expenses</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>285,838.93</strong>
                </td>
              </tr>
              <tr>
                <td>Operational Expenses</td>
                <td className={tableNumberClasses}>32,679.86</td>
              </tr>
              <tr>
                <td>Advertising Expense</td>
                <td className={tableNumberClasses}>154.61</td>
              </tr>
              <tr>
                <td>Fundraising Expense</td>
                <td className={tableNumberClasses}>4,218.80</td>
              </tr>
              <tr>
                <td>Salary Expense</td>
                <td className={tableNumberClasses}>121,240.94</td>
              </tr>
              <tr>
                <td>Insurance Expense</td>
                <td className={tableNumberClasses}>16,429.08</td>
              </tr>
              <tr>
                <td>Repairs and Maintenance Expense</td>
                <td className={tableNumberClasses}>38,792.41</td>
              </tr>
              <tr>
                <td>Meals &amp; Entertainment</td>
                <td className={tableNumberClasses}>1,344.43</td>
              </tr>
              <tr>
                <td>Office Supplies &amp; Software Expense</td>
                <td className={tableNumberClasses}>5,551.98</td>
              </tr>
              <tr>
                <td>Other Income &amp; Expenses</td>
                <td className={tableNumberClasses}>3,318.66</td>
              </tr>
              <tr>
                <td>Tax Expense</td>
                <td className={tableNumberClasses}>147.00</td>
              </tr>
              <tr>
                <td>Depreciation</td>
                <td className={tableNumberClasses}>10,297.08</td>
              </tr>
              <tr>
                <td>Utilities Expense</td>
                <td className={tableNumberClasses}>9,516.09</td>
              </tr>
              <tr>
                <td>Travel Expense</td>
                <td className={tableNumberClasses}>3,229.19</td>
              </tr>
              <tr>
                <td>Contractor Expense</td>
                <td className={tableNumberClasses}>15,512.46</td>
              </tr>
              <tr>
                <td>Streaming Expense</td>
                <td className={tableNumberClasses}>17,024.54</td>
              </tr>
              <tr>
                <td>Legal &amp; Professional Fees</td>
                <td className={tableNumberClasses}>6,381.80</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Net Income</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>14,227.86</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Assets</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>621,387.23</strong>
                </td>
              </tr>
              <tr>
                <td>Total Current Assets - Cash</td>
                <td className={tableNumberClasses}>117,763.40</td>
              </tr>
              <tr>
                <td>Total Fixed Assets</td>
                <td className={tableNumberClasses}>503,623.83</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
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
                <td className={tableNumberClasses}>
                  <strong>677.99</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
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
                <td className={tableNumberClasses}>
                  <strong>620,709.24</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
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
                <td className={tableNumberClasses}>
                  <strong>621,387.23</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box dark className="space-y-4">
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
        </Box>
      </>
    ),
    filing: filing2022Pdf,
  },
  {
    year: 2023,
    image: report2023Image,
    alt: (
      <>
        <Box dark>
          <Heading level={2}>Followers</Heading>

          <table className={tableClasses}>
            <tbody>
              <tr>
                <td>Twitch</td>
                <td className={tableNumberClasses}>68,600</td>
                <td className={tableNumberClasses}>144,000</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td className={tableNumberClasses}>47,000</td>
                <td className={tableNumberClasses}>96,000</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td className={tableNumberClasses}>25,400</td>
                <td className={tableNumberClasses}>197,000</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td className={tableNumberClasses}>41,800</td>
                <td className={tableNumberClasses}>127,500</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td className={tableNumberClasses}>67,700</td>
                <td className={tableNumberClasses}>81,650</td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box dark>
          <Heading level={-1}>
            319 million minutes watched on Twitch by the end of 2023
          </Heading>
        </Box>

        <Box dark>
          <Heading level={2}>Financial Report</Heading>

          <table className={tableClasses}>
            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Income</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>891,597.46</strong>
                </td>
              </tr>
              <tr>
                <td>Income</td>
                <td className={tableNumberClasses}>723,219.83</td>
              </tr>
              <tr>
                <td>Sponsors</td>
                <td className={tableNumberClasses}>109,335.46</td>
              </tr>
              <tr>
                <td>Sales of Merchandise</td>
                <td className={tableNumberClasses}>59,041.90</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Expenses</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>570,027.28</strong>
                </td>
              </tr>
              <tr>
                <td>Operational Expenses</td>
                <td className={tableNumberClasses}>90,618.62</td>
              </tr>
              <tr>
                <td>Advertising Expense</td>
                <td className={tableNumberClasses}>0.00</td>
              </tr>
              <tr>
                <td>Fundraising Expense</td>
                <td className={tableNumberClasses}>10,336.05</td>
              </tr>
              <tr>
                <td>Salary Expense</td>
                <td className={tableNumberClasses}>243,358.62</td>
              </tr>
              <tr>
                <td>Insurance Expense</td>
                <td className={tableNumberClasses}>22,168.55</td>
              </tr>
              <tr>
                <td>Repairs and Maintenance</td>
                <td className={tableNumberClasses}>52,267.97</td>
              </tr>
              <tr>
                <td>Meals &amp; Entertainment</td>
                <td className={tableNumberClasses}>5,784.11</td>
              </tr>
              <tr>
                <td>Office Supplies &amp; Software</td>
                <td className={tableNumberClasses}>11,498.69</td>
              </tr>
              <tr>
                <td>Tax Expense</td>
                <td className={tableNumberClasses}>4,982.55</td>
              </tr>
              <tr>
                <td>Depreciation</td>
                <td className={tableNumberClasses}>19,857.56</td>
              </tr>
              <tr>
                <td>Utilities Expense</td>
                <td className={tableNumberClasses}>7,413.45</td>
              </tr>
              <tr>
                <td>Travel Expense</td>
                <td className={tableNumberClasses}>5,090.08</td>
              </tr>
              <tr>
                <td>Contractor Expense</td>
                <td className={tableNumberClasses}>69,597.38</td>
              </tr>
              <tr>
                <td>Streaming Expense</td>
                <td className={tableNumberClasses}>25,196.07</td>
              </tr>
              <tr>
                <td>Legal &amp; Professional Fees</td>
                <td className={tableNumberClasses}>1,857.58</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Net Income</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>321,570.18</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Assets</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>944,394.94</strong>
                </td>
              </tr>
              <tr>
                <td>Fixed Assets</td>
                <td className={tableNumberClasses}>542,780.17</td>
              </tr>
              <tr>
                <td>Current Assets</td>
                <td className={tableNumberClasses}>401,614.77</td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box dark className="space-y-4">
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
        </Box>
      </>
    ),
    filing: filing2023Pdf,
  },
  {
    year: 2024,
    image: report2024Image,
    alt: (
      <>
        <Box dark className="space-y-4">
          <Heading level={2}>2024 Overview</Heading>

          <p>
            In 2024 Alveus continued our mission to inspire online audiences to
            engage in conservation efforts by creating content that teaches them
            to fall in love with a myriad of species represented by
            non-releasable animal ambassadors. Alveus hosted over 30 content
            creators for collaborations that reached millions of people around
            the world.
          </p>

          <p>
            Together, the Alveus community also contributed over 9,000 hours to
            our planet through volunteering, exploring, picking up trash, and
            much more, sharing them through Show and Tell.
          </p>

          <p>
            Thank you so much to the Alveus community for your continued
            support. With your help, we are able to continue giving a voice to
            vulnerable species around the globe and providing excellent care to
            our animal ambassadors.
          </p>
        </Box>

        <Box dark>
          <Heading level={2}>Follower Growth</Heading>

          <table className={tableClasses}>
            <tbody>
              <tr>
                <td>Twitch</td>
                <td className={tableNumberClasses}>144,000</td>
                <td className={tableNumberClasses}>248,529</td>
              </tr>
              <tr>
                <td>YouTube</td>
                <td className={tableNumberClasses}>197,000</td>
                <td className={tableNumberClasses}>347,877</td>
              </tr>
              <tr>
                <td>Instagram</td>
                <td className={tableNumberClasses}>96,000</td>
                <td className={tableNumberClasses}>132,438</td>
              </tr>
              <tr>
                <td>TikTok</td>
                <td className={tableNumberClasses}>127,500</td>
                <td className={tableNumberClasses}>211,000</td>
              </tr>
              <tr>
                <td>X (Twitter)</td>
                <td className={tableNumberClasses}>81,650</td>
                <td className={tableNumberClasses}>95,772</td>
              </tr>
            </tbody>
          </table>
        </Box>

        <Box dark>
          <Heading level={-1}>
            Over 100 Million impressions across all platforms
          </Heading>
        </Box>

        <Box dark>
          <Heading level={2}>Financial Report</Heading>

          <table className={tableClasses}>
            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Income</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>1,592,716</strong>
                </td>
              </tr>
              <tr>
                <td>Donations and Grants</td>
                <td className={tableNumberClasses}>1,083,539.20</td>
              </tr>
              <tr>
                <td>Ads and Sponsorships</td>
                <td className={tableNumberClasses}>395,338.83</td>
              </tr>
              <tr>
                <td>Sales of Merchandise</td>
                <td className={tableNumberClasses}>113,837.97</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Total Expenses</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>901,591</strong>
                </td>
              </tr>
              <tr>
                <td>Expense</td>
                <td className={tableNumberClasses}>2,740.12</td>
              </tr>
              <tr>
                <td>Contractor Expense</td>
                <td className={tableNumberClasses}>107,299.05</td>
              </tr>
              <tr>
                <td>Fundraising Expense</td>
                <td className={tableNumberClasses}>14,202.94</td>
              </tr>
              <tr>
                <td>Salary Expense</td>
                <td className={tableNumberClasses}>405,030.00</td>
              </tr>
              <tr>
                <td>Insurance</td>
                <td className={tableNumberClasses}>37,681.12</td>
              </tr>
              <tr>
                <td>Repairs &amp; Maintenance</td>
                <td className={tableNumberClasses}>100,955.66</td>
              </tr>
              <tr>
                <td>Meals &amp; Entertainment</td>
                <td className={tableNumberClasses}>10,348.05</td>
              </tr>
              <tr>
                <td>Office Supplies &amp; Software</td>
                <td className={tableNumberClasses}>28,622.63</td>
              </tr>
              <tr>
                <td>Taxes &amp; Licenses</td>
                <td className={tableNumberClasses}>22,286.42</td>
              </tr>
              <tr>
                <td>Depreciation</td>
                <td className={tableNumberClasses}>29,453.41</td>
              </tr>
              <tr>
                <td>Utilities</td>
                <td className={tableNumberClasses}>18,877.97</td>
              </tr>
              <tr>
                <td>Travel</td>
                <td className={tableNumberClasses}>24,748.49</td>
              </tr>
              <tr>
                <td>Other Business Expenses</td>
                <td className={tableNumberClasses}>187.00</td>
              </tr>
              <tr>
                <td>Streaming Supplies</td>
                <td className={tableNumberClasses}>26,194.52</td>
              </tr>
              <tr>
                <td>Legal &amp; Professional Fees</td>
                <td className={tableNumberClasses}>1,278.16</td>
              </tr>
              <tr>
                <td>Vet Fees &amp; Medicine</td>
                <td className={tableNumberClasses}>32,101.05</td>
              </tr>
              <tr>
                <td>Feed &amp; Animal Supplies</td>
                <td className={tableNumberClasses}>37,603.97</td>
              </tr>
              <tr>
                <td>Advertising &amp; Marketing</td>
                <td className={tableNumberClasses}>0.00</td>
              </tr>
              <tr>
                <td>Keeper Equipment</td>
                <td className={tableNumberClasses}>3,559.55</td>
              </tr>
              <tr>
                <td>Bank Charges &amp; Fees</td>
                <td className={tableNumberClasses}>-1,579.38</td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Net Income</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>691,126</strong>
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableBreakClasses}>
                <td colSpan={2}>
                  <hr />
                </td>
              </tr>
            </tbody>

            <tbody>
              <tr className={tableHeadClasses}>
                <td>
                  <strong>Net Assets</strong>
                </td>
                <td className={tableNumberClasses}>
                  <strong>1,633,405</strong>
                </td>
              </tr>
              <tr>
                <td>Total Assets</td>
                <td className={tableNumberClasses}>1,645,560.00</td>
              </tr>
              <tr>
                <td>Total Liabilities</td>
                <td className={tableNumberClasses}>12,155.00</td>
              </tr>
            </tbody>
          </table>
        </Box>
      </>
    ),
    filing: filing2024Pdf,
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
