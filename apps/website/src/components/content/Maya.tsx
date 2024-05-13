import Image from "next/image";

import { classes } from "@/utils/classes";

import mayaHigaAlt from "@/assets/people/maya-higa-alt.jpg";
import mayaHiga from "@/assets/people/maya-higa.jpg";

const Maya = ({ className }: { className?: string }) => (
  <div className={classes("z-0 flex items-center justify-center", className)}>
    <Image
      src={mayaHigaAlt}
      alt="Maya Higa, with Winnie the Moo resting her head on Maya's shoulder"
      width={300}
      height={300}
      className="z-10 -mr-[10%] h-auto w-2/5 max-w-64 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
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

export default Maya;
