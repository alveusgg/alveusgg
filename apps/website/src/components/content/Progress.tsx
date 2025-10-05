import { classes } from "@/utils/classes";

const barClasses =
  "absolute inset-y-0 left-0 min-w-10 rounded-full border-4 border-alveus-green-900 transition-all duration-[2s] ease-in-out";

const Progress = ({ progress }: { progress: number }) => (
  <div className="relative my-1 h-10 w-full rounded-full bg-alveus-green-900 shadow-lg">
    <div
      className={classes(barClasses, "bg-alveus-green")}
      style={{ width: `${progress}%` }}
    />

    <div
      className={classes(
        barClasses,
        "bg-alveus-tan bg-gradient-to-r from-blue-800 to-green-600",
        progress === 0 ? "opacity-0" : "animate-pulse-slow",
      )}
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default Progress;
