import Button from "@/components/content/Button";
import useIsActivePath from "@/hooks/active";

export function ShowAndTellNavigation() {
  return (
    <div className="flex flex-wrap gap-2 whitespace-nowrap text-center lg:flex-col">
      <Button
        href="/show-and-tell"
        dark
        filled={useIsActivePath("/show-and-tell", true)}
      >
        All Posts
      </Button>
      <Button
        href="/show-and-tell/my-posts"
        dark
        filled={useIsActivePath("/show-and-tell/my-posts")}
      >
        My Posts
      </Button>
      <Button
        href="/show-and-tell/submit-post"
        dark
        filled={useIsActivePath("/show-and-tell/submit-post")}
      >
        Submit Post
      </Button>
    </div>
  );
}
