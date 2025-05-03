import type { ReactNode } from "react";

import { convertToSlug } from "@/utils/slugs";

import Link from "@/components/content/Link";

import artAuction2022Video from "@/assets/events/art-auction-2022.mp4";
import artAuction2023Video from "@/assets/events/art-auction-2023.mp4";
import artAuction2024Video from "@/assets/events/art-auction-2024.mp4";
import artAuction2025Video from "@/assets/events/art-auction-2025.mp4";
import fallCarnival20232024Video from "@/assets/events/fall-carnival-2023-2024.mp4";
import fundathon2021Video from "@/assets/events/fundathon-2021.mp4";
import halloween2021Video from "@/assets/events/halloween-2021.mp4";
import summerCamp20232024Video from "@/assets/events/summer-camp-2023-2024.mp4";
import valentines2023Video from "@/assets/events/valentines-2023.mp4";
import valentines2024Video from "@/assets/events/valentines-2024.mp4";

export type Event = {
  name: string;
  slug: string;
  date: Date;
  video: Video;
  stats: Record<string, { title: string; stat: string }>;
  info: ReactNode;
};

const events: Event[] = (
  [
    {
      name: "Art Auction 2025",
      date: new Date("2025-04-22"),
      video: artAuction2025Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$87,256",
        },
        artworksSold: {
          title: "Artworks sold",
          stat: "36",
        },
        signedPrints: {
          title: "Signed prints for donors",
          stat: "452",
        },
        averagePrice: {
          title: "Average donation for each artwork",
          stat: "$1,866",
        },
      },
      info: (
        <>
          <p>
            Celebrating Earth Day, the 2025 Art Auction was a huge success.
            Hosted in the Session Yard again, 36 pieces of art created by the
            ambassadors and the staff at Alveus were up for auction, as well as
            a signed print available for anyone who donated $25 or more during
            the event.
          </p>
          <p>
            By the end of the event, we raised $87,256 for Alveus Sanctuary,
            with 452 signed postcards sent out to donors. The most successful
            ambassador artist this year was{" "}
            <Link href="/ambassadors/stompy">Stompy</Link>, with his painting
            and foot casting being won for over $12,000 combined. The top
            painting sold for $11,111 this year, and was created by Maya
            herself. Thank you to everyone who participated by bidding on an
            item, donating for a signed print, or just watching the livestream!
          </p>
        </>
      ),
    },
    {
      name: "Fall Carnival 2024",
      date: new Date("2024-11-04"),
      video: fallCarnival20232024Video,
      stats: {
        uniqueViewers: {
          title: "Unique viewers tuned in",
          stat: "62,713",
        },
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$29,989",
        },
        postcardsSent: {
          title: "Postcards sent to donors",
          stat: "320",
        },
        bingoPlayers: {
          title: "Viewers played virtual bingo",
          stat: "1,056",
        },
      },
      info: (
        <>
          <p>
            Celebrating fall and halloween, the Fall Carnival was a 3-hour-long
            livestreamed event with a variety of games for the ambassadors at
            Alveus, and the viewers watching along, to participate in. Visiting
            multiple enclosures around the property, games included virtual
            bingo, a race with the cockroaches, card tricks with the crows, and
            more, all where the live stream viewers could earn points by
            guessing the outcomes of the games.
          </p>
          <p>
            Any donation of $25 or more during the event would get a signed
            postcard sent to the donor, and by the end of the event 320
            postcards had been sent out. The first game of the afternoon was a
            game of virtual bingo with the marmosets, where over 1,000 viewers
            joined in at home. By the end of the event, over 60,000 unique
            viewers had tuned in to watch the activities and had raised $29,989
            for Alveus Sanctuary. Thank you to everyone that watched and
            supported this event!
          </p>
        </>
      ),
    },
    {
      name: "Summer Camp 2024",
      date: new Date("2024-07-13"),
      video: summerCamp20232024Video,
      stats: {
        totalViews: {
          title: "Total livestream views",
          stat: "260,896",
        },
        signedPrints: {
          title: "Signed postcards with merch",
          stat: "1,280",
        },
        giveawayWinners: {
          title: "Giveaway winners",
          stat: "17",
        },
        minutesWatched: {
          title: "Minutes watched live",
          stat: "3,365,000",
        },
      },
      info: (
        <>
          <p>
            Summer Camp 2024 was a 12-hour-long event with a variety of
            activities that the staff at Alveus participated in. Hosted in and
            around the Session Yard at Alveus, the team had a water balloon
            catapult war, played a game of human battleships, went hunting for
            bugs around the property, had a campfire cookout, and more, all
            streamed live for viewers to watch.
          </p>
          <p>
            This year, as part of Summer Camp, limited-time merch was available
            for viewers to purchase &mdash; a hoodie or pajama pants. Viewers
            were also able gift pre-paid merch to the livestream chat where
            another random viewer would be picked to win it. Each merch purchase
            or gift also came with a signed postcard from the event, and an
            entry into the giveaways. Throughout the event giveaways were run
            for unique items from Summer Camp, with each merch item purchased or
            gifted giving that viewer an entry to win. By the end of the event
            17 bits of Summer Camp history had been given away and 1,280
            postcards had been sent out to viewers who purchased or gifted
            merch. Thank you to everyone that supported Alveus by watching the
            stream or checking out the merch!
          </p>
        </>
      ),
    },
    {
      name: "Art Auction 2024",
      date: new Date("2024-05-23"),
      video: artAuction2024Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$44,181",
        },
        paintingsSold: {
          title: "Paintings sold",
          stat: "35",
        },
        signedPrints: {
          title: "Signed postcards for donors",
          stat: "499",
        },
        averagePrice: {
          title: "Average donation for each painting",
          stat: "$870",
        },
      },
      info: (
        <>
          <p>
            Hosted in the Session Yard at Alveus once again, the annual Art
            Auction returned and was a great success. 35 unique paintings
            created by the ambassadors and the staff at the sanctuary were up
            for auction, with livestream viewers able to bid on them. Viewers
            could also participate in the fundraising by donating $25 or more to
            receive a signed postcard as a memento of the event -- by the end of
            the 4-hour-long event, 499 postcards were sent out to donors.
          </p>
          <p>
            Maya was the most successful artist this year, with her two
            paintings raising a total of $2,666. Our most successful ambassador
            artists though were{" "}
            <Link href="/ambassadors/chips-ahoy">Chips</Link> and{" "}
            <Link href="/ambassadors/nilla-wafer">Nilla</Link>, our rats, who
            raised $2,500 with their two paintings. In total, we were able to
            raise $44,181 for Alveus Sanctuary during the event. Thank you to
            everyone who watched and supported this event!
          </p>
        </>
      ),
    },
    {
      name: "Valentine's Day 2024",
      date: new Date("2024-02-14"),
      video: valentines2024Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$32,697",
        },
        signedPostcards: {
          title: "Signed postcards sent to donors",
          stat: "467",
        },
        plushies: {
          title: "Hand-crafted plushies distributed",
          stat: "18",
        },
        revealed: {
          title: "New ambassador revealed",
          stat: "1",
        },
      },
      info: (
        <>
          <p>
            Celebrating Valentine&apos;s Day once again, live viewers joined us
            for a short fundraising stream. They were able to donate $25 or more
            to get a signed postcard with artwork featuring the ambassadors to
            commemorate the event, and an entry into the raffle. During the
            event, we were able to raise $32,697 for the sanctuary, with 467
            postcards sent out to donors. The top 3 donors during the event were
            able to pick the plushie they would like, and the remaining 15
            plushies, all handcrafted by Maya, were distributed to random raffle
            winners from those who donated $25 or more.
          </p>
          <p>
            We also revealed a new ambassador during the event, introducing
            everyone to <Link href="/ambassadors/push-pop">Push Pop</Link>, our
            Sulcata Tortoise. Live viewers also got to meet many of our other
            ambassadors as we headed around the property to distribute
            Valentine&apos;s-themed enrichment (crafted items to help encourage
            natural behaviors like foraging) to them. Thanks to everyone who
            tuned in and supported this event!
          </p>
        </>
      ),
    },
    {
      name: "Fall Carnival 2023",
      date: new Date("2023-11-04"),
      video: fallCarnival20232024Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$16,057",
        },
        signedTickets: {
          title: "Signed tickets sent to donors",
          stat: "330",
        },
        ambassadorPolaroids: {
          title: "Ambassador polaroids distributed",
          stat: "36",
        },
        uniqueDonors: {
          title: "Unique donors during the broadcast",
          stat: "200",
        },
      },
      info: (
        <>
          <p>
            A fun-filled event at Alveus Sanctuary, where live viewers on the
            stream could compete against each other and ambassadors at Alveus to
            earn virtual points. To help raise funds for Alveus, any donation
            over $25 would get a signed ticket sent to them, and any donation
            over $250 would get a signed polaroid of one of the ambassadors.
          </p>
          <p>
            Live viewers could earn points in a variety of events, including a
            rat maze with riddles to solve in each room as the ambassadors
            explored the maze, ring toss with{" "}
            <Link href="/ambassadors/abbott">Abbott</Link> the crow, and a race
            with the{" "}
            <Link href="/ambassadors/barbara-baked-bean">cockroaches</Link>.
            Throughout the whole event a game of bingo was also being played
            with the live viewers, with ambassadors around the property picking
            out numbers.
          </p>
          <p>
            By the end of the 3-hour-long event, we were able to raise $16,057
            for Alveus Sanctuary, with 330 signed carnival tickets being sent to
            the donors and 36 ambassador polaroids being sent out to those that
            went the extra mile in their donations. Thank you to everyone that
            watched and supported this spooky event!
          </p>
        </>
      ),
    },
    {
      name: "Summer Camp 2023",
      date: new Date("2023-07-21"),
      video: summerCamp20232024Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$14,070",
        },
        uniqueViewers: {
          title: "Unique viewers tuned in",
          stat: "414,000",
        },
        craftsAuctioned: {
          title: "Summer crafts auctioned off",
          stat: "16",
        },
        minutesStreamed: {
          title: "Minutes streamed live",
          stat: "1,495",
        },
      },
      info: (
        <>
          <p>
            A 24-hour-long livestream event, featuring many of the Alveus staff
            camping in the Session Yard at Alveus. There were plenty of
            activities for the staff to participate in, including an archery
            competition to start the event off, a water balloon fight later in
            the day, cooking dinner around a campfire, late-night beer pong and
            feeding the pasture with a catapult.
          </p>
          <p>
            After camping overnight, still on the stream, the event ended with a
            craft auction where viewers could bid and donate on 16 different
            crafts made by the staff for the event, including multiple
            friendship bracelets, two different Summer Camp paintings, a few
            ambassador-themed hats, two handcrafted pet rocks, a rubber chicken
            and the Summer Camp Spirit Stick itself.
          </p>
          <p>
            Over the course of the 24-hour stream, a total of $14,070 was raised
            for Alveus Sanctuary, with $6,291 of that coming from the craft
            auction. Thank you to everyone that watched the stream, and to
            everyone that donated to support the sanctuary!
          </p>
        </>
      ),
    },
    {
      name: "Art Auction 2023",
      date: new Date("2023-04-22"),
      video: artAuction2023Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$63,019",
        },
        signedPrints: {
          title: "Signed postcards for donors",
          stat: "261",
        },
        ambassadorPaintings: {
          title: "Ambassador paintings sold",
          stat: "33",
        },
        averagePrice: {
          title: "Paid for each painting on average",
          stat: "$570",
        },
      },
      info: (
        <>
          <p>
            Hosted in the Session Yard at Alveus, with Connor and Alex from the
            Alveus team as the auctioneers, the Art Auction 2023 was a huge
            success. Livestream viewers were able to bid on paintings created by
            the ambassadors at Alveus via chat, with 33 paintings being sold
            this year. For viewers who were unable to win a painting, they had
            the option to donate $25 or more to get a signed postcard for the
            event, and 261 wonderful donors claimed one.
          </p>
          <p>
            The event raised $63,019 for Alveus Sanctuary over the course of the
            3.5-hour-long event, with $31,500 of that from an incredibly
            generous donation by Rotary at the end of the event.{" "}
            <Link href="/ambassadors/georgie">Georgie</Link> was our most
            successful ambassador artist this year, with his four paintings
            raising $4,225 in donations, with the top one selling for $2.1k.
            Thank you to everyone that watched and supported this event!
          </p>
        </>
      ),
    },
    {
      name: "Valentine's Day 2023",
      date: new Date("2023-02-14"),
      video: valentines2023Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$40,076",
        },
        signedPostcards: {
          title: "Signed postcards sent to donors",
          stat: "596",
        },
        dabloons: {
          title: "Dabloons distributed to donors",
          stat: "1,600",
        },
        viewers: {
          title: "Peak viewers on the stream",
          stat: "9,729",
        },
      },
      info: (
        <>
          <p>
            To celebrate Valentine&apos;s Day, we hosted a short livestream
            fundraiser. Viewers were able to donate $25 or more to get a signed
            postcard for the event, and the chance to win an ambassador plushie
            handcrafted by Maya. We were able to raise $40,076 for Alveus over
            the 3-hour-long event, with 596 donors claiming a postcard.
          </p>
          <p>
            Each donation of $25 or more would also include some 3D-printed
            dabloons ($25 per dabloon), which also represented an entry into the
            plushie giveaway (one free entry was available for anyone unable to
            donate). The top 5 donors during the event were able to pick which
            plushie they would like, and the remaining 19 plushies were
            distributed based on random golden dabloons amongst the 1,600
            dabloons sent out to donors. Thank you to everyone that watched and
            supported this event!
          </p>
        </>
      ),
    },
    {
      name: "Art Auction 2022",
      date: new Date("2022-04-22"),
      video: artAuction2022Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$42,104",
        },
        signedPrints: {
          title: "Signed prints sent to donors",
          stat: "199",
        },
        auctionWinners: {
          title: "Auction winners",
          stat: "23",
        },
        ambassadorPaintings: {
          title: "Ambassador paintings sold",
          stat: "30",
        },
      },
      info: (
        <p>
          30 incredible paintings produced by the ambassadors at Alveus (with
          help from our animal care staff) were up for auction, with livestream
          viewers able to bid in real-time to get one. Alongside the paintings,
          anyone was able to donate $100 or more to claim a signed print of a
          painting containing all the ambassadors. During the event, we raised
          $42,104 for Alveus Sanctuary, with 199 donors claiming a print. Thank
          you for your support!
        </p>
      ),
    },
    {
      name: "Halloween 2021",
      date: new Date("2021-10-31"),
      video: halloween2021Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$101,971",
        },
        uniqueDonors: {
          title: "Unique donors during the broadcast",
          stat: "1,235",
        },
        namesWritten: {
          title: "Names written on the wall by creators",
          stat: "244",
        },
        creators: {
          title: "Creators attended the event",
          stat: "34",
        },
        viewers: {
          title: "Peak viewers on the stream",
          stat: "93,000",
        },
      },
      info: (
        <>
          <p>
            The Halloween event at Alveus was a massive success, with 34
            creators from across the streaming space descending on the sanctuary
            to help raise money for the animals. During the event, anyone that
            donated $250 or more had their name written on the side wall of the
            Nutrition House, with the wall being sealed after the event. Over
            the evening, 5 hours of live content, we were able to raise $101,971
            for Alveus Sanctuary, with 1,235 donors claiming a name on the wall.
          </p>
          <p>
            Two teams were formed from the creators, and they competed in many
            activities around the property throughout the event. A game of apple
            bobbing started the evening off, followed by hale bale throwing to
            see which team had better technique. A little while later, we had a
            game of badminton on the grass, followed by trivia and then the dunk
            tank. We rounded off the evening with some mud wrestling. Thank you
            to all the creators that joined us, and everyone who watched and
            donated!
          </p>
        </>
      ),
    },
    {
      name: "Fund-a-thon 2021",
      date: new Date("2021-02-10"),
      video: fundathon2021Video,
      stats: {
        totalDonations: {
          title: "Raised for Alveus Sanctuary",
          stat: "$573,004",
        },
        uniqueDonors: {
          title: "Unique donors during the broadcast",
          stat: "3,904",
        },
        leaves: {
          title: "Engraved leaves on the donator trees",
          stat: "2,455",
        },
        viewers: {
          title: "Peak viewers on the stream",
          stat: "82,000",
        },
      },
      info: (
        <p>
          The event that started it all! A 20-hour-long mega-stream with a bunch
          of donation goals along the way, aiming to raise as much money as
          possible to kick-start Alveus. Each donor that donated $100 or more
          got their name engraved on a golden leaf that form part of six donor
          trees now affixed to the back of the studio building. The final goal
          for the stream was that at $500k raised Maya would shave her head, and
          we were able to reach that goal with $573,004 raised for Alveus over
          the whole stream. Thank you to all the leafers, everyone that donated
          and everyone that watched!
        </p>
      ),
    },
  ] as const
)
  .toSorted((a, b) => b.date.getTime() - a.date.getTime())
  .reduce(
    ({ events, slugs }, event) => {
      const slug = convertToSlug(event.name);
      if (slugs.has(slug)) throw new Error(`Duplicate event slug: ${slug}`);

      return {
        events: [...events, { ...event, slug }],
        slugs: slugs.add(slug),
      };
    },
    { events: [] as Event[], slugs: new Set<string>() },
  ).events;

export default events;
