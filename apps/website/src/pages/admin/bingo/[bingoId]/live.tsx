import type {
  InferGetStaticPropsType,
  NextPage,
  GetServerSidePropsContext,
} from "next";

import { useMemo } from "react";

import { permissions } from "@/config/permissions";

import { classes } from "@/utils/classes";
import {
  type BingoValue,
  bingoTypeDefs,
  calcBingoConfig,
  checkHasBingo,
  isBingoType,
  isCellPartOfBingo,
  parseBingoPlayData,
} from "@/utils/bingo";
import { trpc } from "@/utils/trpc";
import { getAdminSSP } from "@/server/utils/admin";

import Meta from "@/components/content/Meta";
import {
  Button,
  dangerButtonClasses,
  defaultButtonClasses,
} from "@/components/shared/Button";
import { MessageBox } from "@/components/shared/MessageBox";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Headline } from "@/components/admin/Headline";
import { Panel } from "@/components/admin/Panel";
import { BingoCardGrid } from "@/components/bingo/BingoCardGrid";
import { transposeMatrix } from "@/utils/math";

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const adminProps = await getAdminSSP(context, permissions.manageBingos);
  if (!adminProps) {
    return { notFound: true };
  }

  const id = context.params?.bingoId;
  if (!id) {
    return { notFound: true };
  }

  return {
    props: {
      ...adminProps,
      bingoId: String(id),
    },
  };
}

function BallGroup({
  calledValues,
  onSelect,
  onDeselect,
  name,
  balls,
}: {
  calledValues: BingoValue[];
  onSelect: (value: BingoValue) => void;
  onDeselect: (value: BingoValue) => void;
  name: string;
  balls: number[];
}) {
  return (
    <div>
      <strong>{name}</strong>
      <ul className="flex flex-wrap gap-1">
        {balls.map((ball) => {
          const isCalled = calledValues.includes(ball);

          return (
            <li key={ball}>
              <Button
                width="auto"
                size="small"
                className={classes(
                  defaultButtonClasses,
                  "aspect-square min-w-[3rem]",
                  calledValues.includes(ball) ? "bg-green-600" : "bg-gray-800",
                )}
                onClick={() => {
                  if (isCalled) {
                    onDeselect(ball);
                  } else {
                    onSelect(ball);
                  }
                }}
              >
                {ball}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BingoBalls75Ball({
  calledValues,
  onSelect,
  onDeselect,
}: {
  calledValues: BingoValue[];
  onSelect: (value: BingoValue) => void;
  onDeselect: (value: BingoValue) => void;
}) {
  const balls = new Array(75).fill(0).map((_, i) => i + 1);

  return (
    <div className="flex flex-col gap-1 tabular-nums">
      <BallGroup
        name="B"
        calledValues={calledValues}
        onSelect={onSelect}
        onDeselect={onDeselect}
        balls={balls.slice(0, 15)}
      />
      <BallGroup
        name="I"
        calledValues={calledValues}
        onSelect={onSelect}
        onDeselect={onDeselect}
        balls={balls.slice(15, 30)}
      />
      <BallGroup
        name="N"
        calledValues={calledValues}
        onSelect={onSelect}
        onDeselect={onDeselect}
        balls={balls.slice(30, 45)}
      />
      <BallGroup
        name="G"
        calledValues={calledValues}
        onSelect={onSelect}
        onDeselect={onDeselect}
        balls={balls.slice(45, 60)}
      />
      <BallGroup
        name="O"
        calledValues={calledValues}
        onSelect={onSelect}
        onDeselect={onDeselect}
        balls={balls.slice(60, 75)}
      />
    </div>
  );
}

const AdminEditBingoPage: NextPage<
  InferGetStaticPropsType<typeof getServerSideProps>
> = ({ menuItems, bingoId }) => {
  const bingo = trpc.adminBingos.getBingo.useQuery(bingoId, {
    refetchInterval: 10_000,
  });
  const type = bingo.data?.type;
  const config = useMemo(
    () => bingo.data && calcBingoConfig(bingo.data.config),
    [bingo],
  );
  const playData = parseBingoPlayData(bingo.data?.playData);

  const callCell = trpc.adminBingos.callCell.useMutation({
    onSuccess: () => {
      bingo.refetch();
    },
  });

  const resetCalledValues = trpc.adminBingos.resetCalledValues.useMutation({
    onSuccess: () => {
      bingo.refetch();
    },
  });

  return (
    <>
      <Meta title="Bingo Live | Admin" />

      <AdminPageLayout title="Bingo Live" menuItems={menuItems}>
        <Headline>Bingo Live - {bingo.data?.label}</Headline>

        {bingo.data && config ? (
          <>
            <Panel>
              <div className="mb-2">
                Type:{" "}
                {type && isBingoType(type)
                  ? bingoTypeDefs[type].label
                  : "Invalid type"}
              </div>

              <div className="mb-2">
                <Button
                  width="auto"
                  className={dangerButtonClasses}
                  confirmationMessage="Please confirm resetting all calls!"
                  onClick={() => {
                    resetCalledValues.mutate(bingoId);
                  }}
                >
                  Reset calls
                </Button>
              </div>

              <BingoBalls75Ball
                calledValues={playData?.calledValues || []}
                onSelect={(value) => {
                  callCell.mutate({
                    bingoId,
                    value,
                    status: true,
                  });
                }}
                onDeselect={(value) => {
                  callCell.mutate({
                    bingoId,
                    value,
                    status: false,
                  });
                }}
              />
            </Panel>

            <Panel>
              <div className="mb-4">
                Players entered: {bingo.data?._count.entries ?? 0}
              </div>
              <div className="flex flex-row flex-wrap gap-2">
                {config.cards.map((card, index) => {
                  const transposedCard = transposeMatrix(card);
                  const [hasBingo, match] = checkHasBingo(
                    transposedCard,
                    playData.calledValues,
                  );

                  return (
                    <div
                      key={index}
                      className={classes(
                        "flex flex-col gap-1",
                        hasBingo && "rounded bg-red-900 ring-4 ring-red-800",
                      )}
                    >
                      <div className="flex flex-col gap-0.5 text-center">
                        <strong>Card #{index + 1}</strong>
                        <BingoCardGrid
                          className="gap-px"
                          size={config.size}
                          renderCell={(_, rowIndex, columnIndex) => {
                            const cellValue =
                              transposedCard[rowIndex]![columnIndex]!;
                            const isCalled =
                              playData.calledValues.includes(cellValue);
                            const isBingoMatch =
                              hasBingo &&
                              isCellPartOfBingo(
                                match,
                                config.size,
                                rowIndex,
                                columnIndex,
                              );

                            return (
                              <div
                                className={classes(
                                  "flex h-4 w-4 items-center justify-center text-center text-[0.5rem] text-black",
                                  isBingoMatch
                                    ? "bg-red-500"
                                    : isCalled
                                    ? "bg-green-600"
                                    : "bg-white",
                                )}
                              >
                                {transposedCard[rowIndex]![columnIndex]!}
                              </div>
                            );
                          }}
                        />
                        <span className="text-sm">
                          {hasBingo ? "BINGO!" : "Open"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </>
        ) : (
          <Panel>
            <MessageBox>Loading …</MessageBox>
          </Panel>
        )}
      </AdminPageLayout>
    </>
  );
};
export default AdminEditBingoPage;
