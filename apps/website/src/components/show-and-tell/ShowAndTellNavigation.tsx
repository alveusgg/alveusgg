import { useActivePath } from "@/hooks/active";

import Button from "@/components/content/Button";

export function ShowAndTellNavigation() {
  return (
    <div className="flex flex-wrap gap-2 text-center whitespace-nowrap lg:flex-col">
      <Button
        href="/show-and-tell"
        dark
        filled={useActivePath("/show-and-tell", true)}
      >
        All Posts
      </Button>
      <Button
        href="/show-and-tell/my-posts"
        dark
        filled={useActivePath("/show-and-tell/my-posts")}
      >
        My Posts
      </Button>
      <Button
        href="/show-and-tell/submit-post"
        dark
        filled={useActivePath("/show-and-tell/submit-post")}
      >
        Submit Post
      </Button>
    </div>
  );
}
