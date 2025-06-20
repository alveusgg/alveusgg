import { classes } from "@/utils/classes";

import Server from "./Server";

const UPS = ({ size = 1, title }: { size?: 1 | 2; title?: string }) => (
  <Server size={size} title={title} background="bg-gray-800">
    <div className="flex h-full">
      {size === 2 && <div className="w-1/4" />}

      <div
        className={classes(
          "flex items-center justify-center rounded-sm bg-gray-500",
          size === 1 ? "w-3/4" : "w-1/2",
        )}
      >
        <div className="aspect-4/1 h-[4cqw] rounded-sm bg-gray-800" />
      </div>

      <div
        className={classes(
          "flex w-1/4 flex-col justify-center",
          size === 1 ? "order-first" : "pl-[6cqw]",
        )}
      >
        <div
          className={classes(
            "flex",
            size === 1 ? "h-5/6" : "flex-col rounded-sm bg-gray-400",
          )}
        >
          <div className="aspect-video shrink-0 rounded-sm border-[0.3cqw] border-gray-400 bg-blue-800" />

          {size === 1 ? (
            <div className="m-auto aspect-square h-1/2 rounded-full bg-gray-400" />
          ) : (
            <div className="my-auto flex grow flex-wrap items-center p-[0.15cqw] pt-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="m-[0.15cqw] aspect-square grow rounded-sm bg-gray-800"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </Server>
);

export default UPS;
