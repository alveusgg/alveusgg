import { useQuery } from "@tanstack/react-query";

import type { MuralId } from "@/data/murals";

import Link from "@/components/content/Link";

import IconLoading from "@/icons/IconLoading";

import type { Leaderboard } from "@/app/api/pixels/[mural]/leaderboard/route";

export default function PixelLeaderboard({
  muralId,
  showLinks = false,
}: {
  muralId: MuralId;
  showLinks?: boolean;
}) {
  // Using react query to fetch pixel leaderboard data from /api/pixels/[mural]/leaderboard
  const query = useQuery<Leaderboard>({
    queryKey: ["pixel-leaderboard", muralId],
    queryFn: async () => {
      const response = await fetch(`/api/pixels/${muralId}/leaderboard`);
      if (!response.ok) {
        throw new Error("Failed to fetch pixel leaderboard");
      }
      return response.json();
    },
    refetchInterval: 30 * 1000, // 30 seconds
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-row gap-4">
        <IconLoading className="size-4" /> Loading leaderboard…
      </div>
    );
  }

  if (query.isError) {
    return <div>Error loading leaderboard: {query.error.message}</div>;
  }

  return (
    <table className="-mx-1 table-auto">
      <thead>
        <tr>
          <th className="p-1 text-right font-bold">#</th>
          <th className="p-1 text-left font-bold">Name</th>
          <th className="p-1 font-bold">Pixels</th>
        </tr>
      </thead>
      <tbody>
        {query.data?.map(([identifier, count], index) => (
          <tr key={identifier} className="border-t border-current/10">
            <td className="px-1 py-0.5 text-right tabular-nums">{index + 1}</td>
            <td className="w-full px-1 py-0.5">
              {showLinks ? (
                <Link
                  dark
                  href={`/institute/pixels/${muralId}?s=${encodeURIComponent(identifier)}`}
                >
                  {identifier}
                </Link>
              ) : (
                identifier
              )}
            </td>
            <td className="px-1 py-0.5 text-right tabular-nums">
              {count.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
