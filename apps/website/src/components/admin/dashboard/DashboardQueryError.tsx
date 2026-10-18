import { MessageBox } from "@/components/shared/MessageBox";
import { Button } from "@/components/shared/form/Button";

export function DashboardQueryError({
  section,
  retry,
}: {
  section: string;
  retry: () => void;
}) {
  return (
    <MessageBox variant="failure">
      <p role="alert">Unable to load {section}.</p>
      <Button
        className="mt-2 bg-gray-700 text-white"
        size="small"
        width="auto"
        onClick={retry}
      >
        Try again
      </Button>
    </MessageBox>
  );
}
