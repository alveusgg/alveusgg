import Image from "next/image";

import mayaHiga from "@/assets/people/maya-higa.jpg";
import mayaHigaAlt from "@/assets/people/maya-higa-alt.jpg";
import { classes } from "@/utils/classes";

const Maya = ({ className }: { className?: string }) => (
  <div className={classes("z-0 flex", className)}>
    <Image
      src={mayaHigaAlt}
      alt="Maya Higa, with Winnie the Moo resting her head on Maya's shoulder"
      width={300}
      height={300}
      className="z-10 my-auto -mr-12 h-auto w-2/3 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
    />
    <Image
      src={mayaHiga}
      alt="Maya Higa"
      width={400}
      height={400}
      className="h-auto w-full max-w-96 rounded-2xl shadow-lg transition-all hover:scale-102 hover:shadow-xl"
    />
  </div>
);

export default Maya;
