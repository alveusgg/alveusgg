import { useState } from "react";
import { useColorSwatch } from "react-aria";
import { CheckboxField } from "@/components/shared/form/CheckboxField";
import { Fieldset } from "@/components/shared/form/Fieldset";

type DominantColorFieldsetProps = {
  savedColor?: string;
};

export function DominantColorFieldset({
  savedColor,
}: DominantColorFieldsetProps) {
  const [override, setOverride] = useState(false);

  const { colorSwatchProps } = useColorSwatch({ color: savedColor });

  return (
    <Fieldset legend="Dominant Color">
      Saved color:
      {savedColor ? <div {...colorSwatchProps} className="size-8" /> : " N/A"}
      <CheckboxField isSelected={override} onChange={setOverride}>
        Override color
      </CheckboxField>
      <input type="color" name="dominantColor" disabled={!override} />
    </Fieldset>
  );
}
