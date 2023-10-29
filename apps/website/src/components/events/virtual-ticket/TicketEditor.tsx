import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import IconTrash from "@/icons/IconTrash";
import IconCheck from "@/icons/IconCheck";
import IconMinusCircle from "@/icons/IconMinusCircle";
import IconChevronLeft from "@/icons/IconChevronLeft";
import IconChevronRight from "@/icons/IconChevronRight";

import {
  type StickerPack,
  type TicketConfig,
  defaultTicketHeight,
  defaultTicketWidth,
  mapStickerIdToPath,
} from "@/utils/virtual-tickets";

import { Button } from "@/components/shared/Button";
import { StickerSelector } from "./StickerSelector";

type StickerDataAction =
  | { type: "set"; stickers: Array<string> }
  | { type: "add"; sticker: string }
  | { type: "remove"; sticker: string }
  | { type: "reset" }
  | { type: "update" }
  | { type: "save" };

type StickerPosition = {
  imageId: string;
  image: string;
  x: number;
  y: number;
};

export type TicketEditorContextValue = {
  canvasWidth: number;
  canvasHeight: number;
  selectedSticker: string | null;
  setSelectedSticker: (
    sticker: string | null | ((cur: string | null) => string | null),
  ) => void;
};

const ticketEditorContext = createContext<TicketEditorContextValue>({
  canvasWidth: 0,
  canvasHeight: 0,
  selectedSticker: null,
  setSelectedSticker: () => null,
});

const stickerDataReducer = (
  state: { dirty: boolean; stickers: Array<string> },
  action: StickerDataAction,
) => {
  switch (action.type) {
    case "set":
      return { ...state, dirty: false, stickers: action.stickers };
    case "add":
      return {
        ...state,
        dirty: true,
        stickers: [...state.stickers, action.sticker],
      };
    case "remove":
      return {
        ...state,
        dirty: true,
        stickers: state.stickers.filter(
          (sticker) => sticker !== action.sticker,
        ),
      };
    case "reset":
      return {
        ...state,
        dirty: true,
        stickers: [],
      };
    case "update":
      return { ...state, dirty: true };
    case "save":
      return { ...state, dirty: false };
  }
};

export function useStickerData(
  ticketConfig: TicketConfig,
  stickerPack: StickerPack,
) {
  const width =
    ticketConfig.canvasWidth || ticketConfig.width || defaultTicketWidth;
  const height =
    ticketConfig.canvasHeight || ticketConfig.height || defaultTicketHeight;

  const [state, dispatch] = useReducer(stickerDataReducer, {
    dirty: true,
    stickers: [],
  });
  const stickerPositions = useRef<Array<StickerPosition>>([]);

  const addSticker = useCallback(
    (imageId: string) => {
      if (state.stickers.includes(imageId)) return;

      const image = mapStickerIdToPath(stickerPack.stickers, imageId);
      if (!image) return;

      stickerPositions.current = [
        ...stickerPositions.current,
        {
          imageId,
          image,
          x: Math.random() * (0.8 * width) + 0.1 * width,
          y: Math.random() * (0.6 * height) + 0.2 * height,
        },
      ];
      dispatch({ type: "add", sticker: imageId });
    },
    [height, state.stickers, stickerPack, width],
  );

  const removeSticker = useCallback(
    (imageId: string) => {
      if (!state.stickers.includes(imageId)) return;
      stickerPositions.current = stickerPositions.current.filter(
        (stickerPosition) => stickerPosition.imageId !== imageId,
      );
      dispatch({ type: "remove", sticker: imageId });
    },
    [state.stickers],
  );

  const updateStickerPosition = useCallback(
    (imageId: string, x: number, y: number) => {
      if (!state.stickers.includes(imageId)) return;
      stickerPositions.current = stickerPositions.current.map(
        (stickerPosition) => {
          if (stickerPosition.imageId !== imageId) return stickerPosition;

          return {
            ...stickerPosition,
            x: Math.round(x),
            y: Math.round(y),
          };
        },
      );
      if (!state.dirty) dispatch({ type: "update" });
    },
    [state.dirty, state.stickers],
  );

  const setStickerData = useCallback(
    (stickerData: Array<{ imageId: string; x: number; y: number }>) => {
      stickerPositions.current = stickerData.map(({ imageId, x, y }) => {
        const path = mapStickerIdToPath(
          stickerPack.stickers,
          imageId,
        ) as string;

        return {
          imageId,
          image: path,
          x: Math.max(0, Math.min(x, width)),
          y: Math.max(0, Math.min(y, height)),
        } satisfies StickerPosition;
      });
      dispatch({
        type: "set",
        stickers: stickerData.map(({ imageId }) => imageId),
      });
    },
    [height, stickerPack, width],
  );

  const resetStickers = useCallback(() => {
    stickerPositions.current = [];
    dispatch({ type: "reset" });
  }, []);

  return {
    isDirty: state.dirty,
    stickers: state.stickers,
    addSticker,
    removeSticker,
    updateStickerPosition,
    stickerPositionsRef: stickerPositions,
    setStickerData,
    saveStickers: () => {
      dispatch({ type: "save" });
    },
    resetStickers,
  };
}

export function useTicketEditorContext() {
  return useContext(ticketEditorContext);
}

export function TicketEditor({
  children,
  width = defaultTicketWidth,
  height = defaultTicketHeight,
  canvasWidth = width,
  canvasHeight = height,
  onSave,
  stickerPack,
  stickerData,
}: {
  children?: ReactNode;
  width?: number;
  height?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  stickerData: ReturnType<typeof useStickerData>;
  onSave: () => void;
  stickerPack: StickerPack;
}) {
  const { removeSticker, addSticker, stickers, isDirty, resetStickers } =
    stickerData;
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const contextValue = useMemo(
    () => ({
      canvasWidth,
      canvasHeight,
      selectedSticker,
      setSelectedSticker,
    }),
    [canvasHeight, canvasWidth, selectedSticker],
  );

  // Using dom traversal to find the mask element, since we can't use refs/state in the virtual ticket component
  // as it gets rendered as a server component with satori for image generation
  const ticketWrapperRef = useRef<HTMLDivElement>(null);

  const toggleGhosts = useCallback((showGhosts: boolean) => {
    const ticketEl = ticketWrapperRef.current?.querySelector(
      "[data-alveus-virtual-ticket-mask]",
    ) as HTMLDivElement | undefined;
    if (ticketEl) {
      let maskImage = ticketEl.getAttribute("data-alveus-virtual-ticket-mask");
      if (maskImage) {
        if (showGhosts) {
          maskImage = maskImage.replace(
            "%3C/svg%3E",
            "%3Crect width='100%' height='100%' fill='rgba(130, 130, 130, 0.5)' /%3E%3C/svg%3E",
          );
        }

        ticketEl.style.setProperty("mask-image", `url("${maskImage}")`);
        ticketEl.style.setProperty("-webkit-mask-image", `url("${maskImage}")`);
      }
    }
  }, []);

  return (
    <ticketEditorContext.Provider value={contextValue}>
      <div className="relative -mx-4 w-[calc(100%+2rem)] bg-black/10">
        <div className="pointer-events-none absolute left-0 right-0 top-0 mt-1 flex flex-row items-center justify-center gap-2 p-2 text-black/50 lg:hidden">
          <IconChevronLeft className="h-4 w-4" />
          swipe to move the ticket
          <IconChevronRight className="h-4 w-4" />
        </div>

        <div className="w-full overflow-x-auto">
          <div
            ref={ticketWrapperRef}
            className="mx-auto flex w-[calc(900px+3rem)] flex-col items-center px-6 py-12 drop-shadow-xl"
            onClick={() => setSelectedSticker(null)}
            onMouseEnter={() => toggleGhosts(true)}
            onTouchStart={() => toggleGhosts(true)}
            onMouseLeave={() => toggleGhosts(false)}
            onTouchEnd={() => toggleGhosts(false)}
          >
            {children}
          </div>
        </div>

        <div className="absolute bottom-0 left-1/2 z-40 -mb-3 flex -translate-x-1/2 gap-1 rounded-2xl bg-white p-0.5 text-sm shadow-xl sm:p-1 md:gap-2 lg:text-base">
          <Button
            className="whitespace-nowrap bg-green-600 text-white disabled:bg-gray-300 disabled:text-gray-900"
            width="auto"
            size="small"
            disabled={!isDirty}
            onClick={() => {
              onSave();
            }}
          >
            {isDirty ? (
              "Save ticket"
            ) : (
              <>
                <IconCheck className="h-6 w-6" />
                Saved
              </>
            )}
          </Button>

          <Button
            className="whitespace-nowrap"
            width="auto"
            size="small"
            disabled={!selectedSticker}
            onClick={() => {
              if (selectedSticker) {
                removeSticker(selectedSticker);
                setSelectedSticker(null);
              }
            }}
          >
            <IconMinusCircle className="h-6 w-6" />
            Remove sticker
          </Button>

          <Button
            className="whitespace-nowrap"
            width="auto"
            size="small"
            confirmationMessage="Are you sure you want to remove all stickers?"
            onClick={resetStickers}
          >
            <IconTrash className="h-6 w-6" />
            Reset
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[899px] md:mt-12">
        <StickerSelector
          stickerPack={stickerPack}
          selectedStickers={stickers}
          onSelect={(imageId) => {
            addSticker(imageId);
            setSelectedSticker(imageId);
          }}
        />
      </div>
    </ticketEditorContext.Provider>
  );
}
