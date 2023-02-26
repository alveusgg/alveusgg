import { type NextPage } from "next";
import React from "react";

import { env } from "@/env/client.mjs";
import { Headline } from "@/components/shared/Headline";
import Section from "@/components/content/Section";
import Heading from "@/components/content/Heading";
import Meta from "@/components/content/Meta";

const Home: NextPage = () => {
  return (
    <>
      <Meta
        title="Contact / Privacy Policy"
        description="At Alveus.gg, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Alveus.gg and how we use it."
      />

      {/* Nav background */}
      <div className="-mt-40 hidden h-40 bg-alveus-green-900 lg:block" />

      {/* Grow the last section to cover the page */}
      <Section className="flex-grow">
        <header>
          <Heading className="my-3 text-3xl">Contact / Privacy Policy</Heading>
        </header>

        <Headline>Contact</Headline>

        <p>
          You can contact me via email:{" "}
          <a href="mailto:admin@alveus.gg">admin@alveus.gg</a>
        </p>

        <Headline>Privacy Policy for Alveus.gg</Headline>

        <p>
          At Alveus.gg, accessible from https://alveus.gg/, one of our main
          priorities is the privacy of our visitors. This Privacy Policy
          document contains types of information that is collected and recorded
          by Alveus.gg and how we use it.
        </p>

        <p>
          If you have additional questions or require more information about our
          Privacy Policy, do not hesitate to contact us.
        </p>

        <p>
          This Privacy Policy applies only to our online activities and is valid
          for visitors to our website with regards to the information that they
          shared and/or collect in Alveus.gg. This policy is not applicable to
          any information collected offline or via channels other than this
          website.
        </p>

        <Headline>Consent</Headline>

        <p>
          By using our website, you hereby consent to our Privacy Policy and
          agree to its terms.
        </p>

        <Headline>Information we collect</Headline>

        <p>
          The personal information that you are asked to provide, and the
          reasons why you are asked to provide it, will be made clear to you at
          the point we ask you to provide your personal information.
        </p>
        <p>
          If you contact us directly, we may receive additional information
          about you such as your name, email address, phone number, the contents
          of the message and/or attachments you may send us, and any other
          information you may choose to provide.
        </p>
        <p>
          When you register for an Account, we may ask for your contact
          information, including items such as name, email address, and
          telephone number.
        </p>

        <Headline>How we use your information</Headline>

        <p>We use the information we collect in various ways, including to:</p>

        <ul className="list-disc pl-6">
          <li>Provide, operate, and maintain our website</li>
          <li>Improve, personalize, and expand our website</li>
          <li>Understand and analyze how you use our website</li>
          <li>Develop new products, services, features, and functionality</li>
          <li>
            Communicate with you, either directly or through one of our
            partners, including for customer service, to provide you with
            updates and other information relating to the website, and for
            marketing and promotional purposes
          </li>
          <li>Send you emails</li>
          <li>Find and prevent fraud</li>
        </ul>

        <Headline>Log Files</Headline>

        <p>
          Alveus.gg follows a standard procedure of using log files. These files
          log visitors when they visit websites. All hosting companies do this
          and a part of hosting services&apos; analytics. The information
          collected by log files include internet protocol (IP) addresses,
          browser type, Internet Service Provider (ISP), date and time stamp,
          referring/exit pages, and possibly the number of clicks. These are not
          linked to any information that is personally identifiable. The purpose
          of the information is for analyzing trends, administering the site,
          tracking users&apos; movement on the website, and gathering
          demographic information.
        </p>

        <Headline>Cookies</Headline>

        {env.NEXT_PUBLIC_COOKIEBOT_ID && (
          <script
            id="CookieDeclaration"
            src={`https://consent.cookiebot.com/${env.NEXT_PUBLIC_COOKIEBOT_ID}/cd.js`}
            async
          />
        )}

        <Headline>Third Party Privacy Policies</Headline>

        <p>
          Alveus.gg&apos;s Privacy Policy does not apply to other websites.
          Thus, we are advising you to consult the respective Privacy Policies
          of these third-party servers for more detailed information. It may
          include their practices and instructions about how to opt-out of
          certain options.
        </p>

        <p>
          You can choose to disable cookies through your individual browser
          options. To know more detailed information about cookie management
          with specific web browsers, it can be found at the browsers&apos;
          respective websites.
        </p>

        <ul className="my-2 ml-8 list-disc">
          <li>
            <a
              href="https://www.twitch.tv/p/en/legal/privacy-notice/"
              rel="noreferrer"
              target="_blank"
            >
              Twitch (Video and Chat embed and Authentication)
            </a>
          </li>
          <li>
            <a
              href="https://vercel.com/legal/privacy-policy"
              rel="noreferrer"
              target="_blank"
            >
              Vercel (Hosting provider)
            </a>
          </li>
          <li>
            <a
              href="https://planetscale.com/legal/privacy"
              rel="noreferrer"
              target="_blank"
            >
              PlanetScale (Database provider)
            </a>
          </li>
        </ul>

        <Headline>GDPR Data Protection Rights</Headline>

        <p>
          We would like to make sure you are fully aware of all of your data
          protection rights. Every user is entitled to the following:
        </p>
        <p>
          The right to access – You have the right to request copies of your
          personal data. We may charge you a small fee for this service.
        </p>
        <p>
          The right to rectification – You have the right to request that we
          correct any information you believe is inaccurate. You also have the
          right to request that we complete the information you believe is
          incomplete.
        </p>
        <p>
          The right to erasure – You have the right to request that we erase
          your personal data, under certain conditions.
        </p>
        <p>
          The right to restrict processing – You have the right to request that
          we restrict the processing of your personal data, under certain
          conditions.
        </p>
        <p>
          The right to object to processing – You have the right to object to
          our processing of your personal data, under certain conditions.
        </p>
        <p>
          The right to data portability – You have the right to request that we
          transfer the data that we have collected to another organization, or
          directly to you, under certain conditions.
        </p>
        <p>
          If you make a request, we have one month to respond to you. If you
          would like to exercise any of these rights, please contact us.
        </p>

        <Headline>Children&apos;s Information</Headline>

        <p>
          Another part of our priority is adding protection for children while
          using the internet. We encourage parents and guardians to observe,
          participate in, and/or monitor and guide their online activity.
        </p>

        <p>
          Alveus.gg does not knowingly collect any Personal Identifiable
          Information from children under the age of 13. If you think that your
          child provided this kind of information on our website, we strongly
          encourage you to contact us immediately and we will do our best
          efforts to promptly remove such information from our records.
        </p>
      </Section>
    </>
  );
};

export default Home;
