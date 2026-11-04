import { type ReactNode } from "react";

const List = ({
  items,
  conjunction = "and",
  oxfordComma = true,
}: {
  items: ReactNode[];
  conjunction?: string;
  oxfordComma?: boolean;
}) =>
  items.flatMap((item, index) => [
    item,
    index < items.length - 2 && ", ",
    index === items.length - 2 && items.length > 2 && oxfordComma && ",",
    index === items.length - 2 && ` ${conjunction} `,
  ]);

export default List;
