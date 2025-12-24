import {
  FloatingPortal,
  type OffsetOptions,
  type Placement,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { type ReactNode, useState } from "react";

type ContentString = {
  content: string;
  aria?: string;
};

type ContentNode = {
  content: ReactNode;
  aria: string;
};

export type UseTooltipProps = (ContentString | ContentNode) & {
  force?: boolean;
  placement?: Placement;
  offset?: OffsetOptions;
};

const useTooltip = ({
  content,
  aria,
  force,
  placement,
  offset: offsetOpts,
}: UseTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement: placement,
    middleware: [offset(offsetOpts), flip(), shift()],
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
  ]);

  const props = {
    // eslint-disable-next-line react-hooks/refs
    ref: refs.setReference,
    "aria-label": typeof content === "string" ? content : aria,
    ...getReferenceProps(),
  };

  const element =
    force || isOpen ? (
      <FloatingPortal>
        <div
          className="pointer-events-none z-100 rounded-md bg-alveus-green-900 px-1 py-0.5 text-left leading-tight text-nowrap text-white"
          // eslint-disable-next-line react-hooks/refs
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {content}
        </div>
      </FloatingPortal>
    ) : null;

  // eslint-disable-next-line react-hooks/refs
  return { props, element };
};

export default useTooltip;
