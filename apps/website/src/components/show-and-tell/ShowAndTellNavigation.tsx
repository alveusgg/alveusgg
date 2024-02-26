import { PageNavigation } from "../shared/PageNavigation";

export default function ShowAndTellNavigation() {
  const showAndTellNavItems = [
    { href: "/show-and-tell/", label: "All Posts", exact: true },
    { href: "/show-and-tell/my-posts", label: "My Posts" },
    { href: "/show-and-tell/submit-post", label: "Submit Post" },
  ];

  return <PageNavigation navItems={showAndTellNavItems} />;
}
