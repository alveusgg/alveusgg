import { type NextPage } from "next";
import Image from "next/image";

import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Button from "@/components/content/Button";
import Meta from "@/components/content/Meta";

import report2021Image from "@/assets/reports/2021.svg";

const AboutAnnualReport2021Page: NextPage = () => {
  return (
    <>
      <Meta
        title="2021 | Annual Reports"
        description="Read through the 2021 Annual Report published by Alveus."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      <Section
        dark
        containerClassName="flex flex-wrap gap-4 justify-between items-end"
      >
        <Heading>2021 Annual Report</Heading>
        <Button href="/about/annual-reports" dark>
          Explore other reports
        </Button>
      </Section>

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <Image
          src={report2021Image}
          quality={100}
          className="mx-auto h-auto w-full max-w-3xl"
          alt="Report graphic"
          aria-describedby="report"
        />

        <div className="sr-only" id="report">
          <div>
            <Heading level={2} className="mt-8">
              Viewer Demographics
            </Heading>

            <p>
              Alveus has the unique ability to reach viewers across the world
              virtually. While educating primarily U.S. viewers, our reach is
              gradually expanding worldwide.
            </p>

            <p>
              Twitch&apos;s user demographic is 41% ages 16-24 and 32% ages
              25-34. With Twitch being our main platform, we have the
              opportunity to reach an audience of budding consumers. This next
              generation will determine the future for our planet.
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
              Alveus has been steadily growing platforms across all social
              media. With larger followings, we are able to educate a wider and
              more diverse online audience.
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
            <Heading level={2} className="mt-8">
              Financial Report
            </Heading>

            <p>
              In 2021, Alveus raised a total of $763,380 USD due to generous
              support in the form of donations. Alveus had a total of
              $144,411.80 in expenses in 2021. An additional $297,197.17 was
              dedicated to enclosures and infrastructure.
            </p>

            <p>
              Note: 2022 financials have not yet been released at this time. A
              2022 report will be created and released in 2023.
            </p>

            <p>
              In 2021, the majority (67.30%) of funds were dedicated to
              development of the facility. This included fencing, enclosure
              builds, interior renovations of buildings, and more. Operating
              expenses included the salary of one staff member (Ella Rocks,
              Animal Care Coordinator) in addition to general animal care costs.
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

          <div>
            <Heading level={2} className="mt-8">
              Continuing Our Mission
            </Heading>

            <p>
              The mission of Alveus is to inspire online audiences to engage in
              conservation efforts. We do this by nurturing a connection between
              viewers and our animal ambassadors so that they learn to care
              about their species.
            </p>

            <p>
              With your continued support, we are able to remain a powerful
              force for conservation while providing enriched and comfortable
              lives for our animal ambassadors.
            </p>

            <p>
              <strong>Thank you.</strong>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
};

export default AboutAnnualReport2021Page;
