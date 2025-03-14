import Image from "next/image";

import { classes } from "@/utils/classes";

import mayaHiga from "@/assets/people/maya-higa.jpg";
import mayaHigaAlt from "@/assets/people/maya-higa-alt.jpg";

export const MayaImage = ({ className }: { className?: string }) => (
  <div className={classes("z-0 flex items-center justify-center", className)}>
    <Image
      src={mayaHigaAlt}
      alt="Maya Higa, with Winnie the Moo resting her head on Maya's shoulder"
      width={300}
      height={300}
      className="z-10 mr-[-10%] h-auto w-2/5 max-w-64 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
    />
    <Image
      src={mayaHiga}
      alt="Maya Higa"
      width={400}
      height={400}
      className="h-auto w-3/5 max-w-96 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
    />
  </div>
);

export const MayaText = () => (
  <>
    <p>
      Maya Higa is one of the top female streamers on Twitch and has amassed a
      large following on YouTube and other social platforms. She integrates her
      passion for wildlife conservation and education into her content
      regularly, creating some of the most unique content on Twitch. Maya has
      experience as a licensed falconer, wildlife rehabilitator, zookeeper, and
      conservation outreach educator.
    </p>
    <p>
      Her livestreams and videos feature conservation education and charity
      fundraising. She created a conservation podcast in 2019 which aired more
      than 60 episodes and raised more than $92,000 for conservation
      organizations around the globe. In 2021, Maya founded Alveus Sanctuary, a
      non-profit wildlife sanctuary and virtual education center in central
      Texas.
    </p>
  </>
);
