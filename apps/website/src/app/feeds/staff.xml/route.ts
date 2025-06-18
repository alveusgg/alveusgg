import { Feed } from "feed";

import { env } from "@/env";

import { type Person } from "@/components/content/People";

import amandaDenaroFunImage from "@/assets/people/amanda-denaro-fun.jpg";
import amandaDenaroImage from "@/assets/people/amanda-denaro.jpg";
import chandlerFunImage from "@/assets/people/chandler-fun.jpg";
import chandlerImage from "@/assets/people/chandler.jpg";
import coltonHolsteImage from "@/assets/people/colton-holste.jpg";
import connorObrienFunImage from "@/assets/people/connor-obrien-fun.jpg";
import connorObrienImage from "@/assets/people/connor-obrien.jpg";
import kaylaJacksonImage from "@/assets/people/kayla-jackson.jpg";
import lindsayBellawFunImage from "@/assets/people/lindsay-bellaw-fun.jpg";
import lindsayBellawImage from "@/assets/people/lindsay-bellaw.jpg";
import lukasMeyerImage from "@/assets/people/lukas-meyer.jpg";
import mayaHigaFunImage from "@/assets/people/maya-higa-fun.jpg";
import mayaHigaImage from "@/assets/people/maya-higa.jpg";
import nickFacilitiesImage from "@/assets/people/nick-facilities.jpg";
import spaceVoyageImage from "@/assets/people/space-voyage.png";
import srutiJamalapuramFunImage from "@/assets/people/sruti-jamalapuram-fun.jpg";
import srutiJamalapuramImage from "@/assets/people/sruti-jamalapuram.jpg";

const staff: Record<string, Person> = {
  maya: {
    image: [mayaHigaImage, mayaHigaFunImage],
    name: "Maya Higa",
    title: "Founder & Executive Director",
    description:
      "Maya Higa is one of the top female streamers on Twitch and has amassed a large following on YouTube and other social platforms. She integrates her passion for wildlife conservation and education into her content regularly, creating some of the most unique content on Twitch. Maya has experience as a licensed falconer, wildlife rehabilitator, zookeeper, and conservation outreach educator." +
      "\nHer livestreams and videos feature conservation education and charity fundraising. She created a conservation podcast in 2019 which aired more than 60 episodes and raised more than $92,000 for conservation organizations around the globe. In 2021, Maya founded Alveus Sanctuary, a non-profit wildlife sanctuary and virtual education center in central Texas.",
    // description2: "I love the natural world with my whole heart and entire being. All I want is to inspire that same love in others."
  },
  connor: {
    image: [connorObrienImage, connorObrienFunImage],
    name: "Connor O'Brien",
    title: "Director of Operations",
    description:
      "Connor has volunteered and worked for many wildlife organizations, most notably the American Eagle Foundation and the Alaska Wildlife Conservation Center. He has taken his love of conservation and technology, combined it, and started helping many conservation organizations around the country develop and scale large conservation projects.",
    // description2: "There is no better place to utilize technology for conservation than Alveus. Connor believes Alveus will set the standard for online education and drive significant impact and reach for conservation education online."
  },
  kayla: {
    image: kaylaJacksonImage,
    name: "Kayla Jackson",
    title: "Director of Animal Care & Training",
    description:
      "Kayla graduated from college with a degree in biology and a desire to see the world. Her travels eventually found her in Alaska, where she realized that animal care and conservation was a cause worth staying for. Since Alaska, she has traveled to Nepal where she developed an unparalleled love and respect for vultures. That interest in birds of prey took her to Tennessee and the American Eagle Foundation, where training became her primary interest and passion. While she specializes in caring for and training birds of prey, Kayla is dedicated to and eager to learn about any species she can. She believes training is an integral part of animal welfare and is excited to build relationships with the Alveus ambassadors to showcase their personalities and inspire dedication to their wild counterparts across an ever-growing online audience.",
  },
  lindsay: {
    image: [lindsayBellawImage, lindsayBellawFunImage],
    name: "Lindsay Bellaw",
    title: "Animal Care Coordinator",
    description:
      "Lindsay graduated college with her Aquatic Biology degree, and her Master&apos;s in Conservation of Marine Predators and Coral Reef Conservation and Aquaculture. She always knew animals were her passion, and loves to travel as much as she can. This brought her to American Eagle Foundation where she grew a love for birds of prey.  Meeting new people, it also took her to Alaska and the Midwest to work with a variety of birds. Since moving to Texas, she has grown to love all sorts of animals and loves to learn about them and tell anyone who will listen about them!",
  },
  sruti: {
    image: [srutiJamalapuramImage, srutiJamalapuramFunImage],
    name: "Sruti Jamalapuram",
    title: "Animal Care Coordinator",
    description:
      "Sruti graduated with a degree in Wildlife Sciences and a Master&apos;s in Biology with a focus on Animal Behavior. As a young volunteer at her local zoo, Sruti was fortunate to realize her passion for animal behavior, conservation, and environmental education. This passion translated to jobs all over the world, participating in field research and education. That trend continued when she moved to Michigan and served as the Mammal Curator for The Creature Conservancy. This opportunity channeled her interest in behavior into training, where she trained with animals both big and small for fear-free veterinary care, educational programs, and mental well-being. To further improve her training skills, Sruti studied and worked with K9 Turbo Training to obtain her certification in professional dog training. She specializes in fear and aggression and loves working with families to create a training environment that is supportive, engaging, and fun for everyone!",
    // description2: "Building relationships with animals, continuing that relationship through time and training, and sharing that experience with others brings her a lot of joy - she is excited to do that alongside the Alveus community!"
  },
  amanda: {
    image: [amandaDenaroImage, amandaDenaroFunImage],
    name: "Amanda Denaro",
    title: "Animal Care Coordinator",
    description:
      "Amanda knew from a young age that she wanted to work with animals.  After graduating with a degree in biology she started her career off as a zookeeper at Zoo Atlanta gaining the opportunity to work with a wide variety of hoofstock, primate, and carnivore species. Her love for educating and inspiring people to learn more about the animals in her care and their wild counterparts grew as well as her desire to build positive relationships with the animals she cared for. When the opportunity arose to work at Alveus, Amanda was beyond excited to be part such of an amazing online community united in the same goal of promoting conservation of our natural world.",
  },
  lukas: {
    image: lukasMeyerImage,
    name: "Lukas Meyer",
    title: "Herpetology & Invert Lead | Habitat Specialist",
    description:
      "Lukas has unique animal, horticulture, and construction experience. He is able to combine all three to create amazing ecosystems for the Alveus ambassadors. He has worked as Curator of Herpetology at the Creature Conservancy, and Habitat Landscape at the Detroit Zoo. Lukas is a big fan of plants and reptiles. His favorite ambassador at Alveus is Pushpop the Sulcata Tortoise.",
  },
  nick: {
    image: nickFacilitiesImage,
    name: "Nick",
    title: "Facilities",
    description: "I&apos;m the neighbor.",
  },
  chandler: {
    image: [chandlerImage, chandlerFunImage],
    name: "Chandler",
    title: "Facilities",
    description: "I&apos;m the zoomer (W Hunger).",
  },
  space: {
    image: spaceVoyageImage,
    name: "SpaceVoyage",
    title: "Director of Production",
    description:
      " Space graduated with a degree in computer science and engineering, and puts that to use at Alveus, being responsible for all the live broadcasts. When he&apos;s not operating cameras and mixing streams, he maintains all the software logic that allows chat moderators to control the livestream layout and camera positions, as well as building one-off automations to support events that we host.",
    // description2: "Space started out working remotely for Maya and Alveus, behind-the-scenes making sure that everything was working flawlessly.  He has since moved to Texas to work on-site at Alveus as an employee, ensuring you get the best viewing experience possible for our educational content."
  },
  colton: {
    image: coltonHolsteImage,
    name: "Colton Holste",
    title: "Creative Producer",
    description:
      "Born and raised in Idaho, Colton studied Media Arts at Boise State University before leaving to take on a full-time role managing a production studio. There, he created marketing campaigns, public television programming, and digital content for a range of clients. In the middle of the COVID pandemic (and against all advice), he relocated to Texas to launch his own media company, which he still runs today. His volunteer work at Alveus Animal Sanctuary eventually led to a formal role producing content for the organization, blending his passion for storytelling with a deep respect for animals and education.  ",
    // description2: "<span>&ldquo;</span>Cinema <span>&rdquo;</span> "
  },
};

export async function GET() {
  const staffPageUrl = `${env.NEXT_PUBLIC_BASE_URL}/about/staff`;

  const latestStaffJoinDate = undefined; // TODO latest staff join date, if available

  const feed = new Feed({
    title: "Alveus Sanctuary Staff",
    description: "A feed for new staff members",
    id: staffPageUrl,
    link: staffPageUrl,
    copyright: "Copyright 2023 Alveus Sanctuary Inc. and the Alveus.gg team",
    updated: latestStaffJoinDate,
  });

  Object.entries(staff).forEach(([key, person]) => {
    const personUrl = `${staffPageUrl}#${key}`;

    feed.addItem({
      title: person.name,
      id: personUrl,
      link: personUrl,
      description: person.title,
      content: person.title,
      date: new Date(), // TODO actual join date, if available
    });
  });

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
