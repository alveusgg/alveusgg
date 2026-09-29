import focus from "./focus.ts";
import ir from "./ir.ts";
import locks from "./locks.ts";
import presets from "./presets.ts";
import ptz from "./ptz.ts";

export default [...ptz, ...ir, ...focus, ...presets, ...locks];
