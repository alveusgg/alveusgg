import { PageNavigation } from "../shared/PageNavigation";

export default function ClipsNavigation() {
  const clipsNavigationItems = [
    {
      href: "/clips/",
      label: "Clips",
      exact: true,
    },
    {
      href: "/clips/submit-clip",
      label: "Submit Clip",
    },
  ];

  return <PageNavigation navItems={clipsNavigationItems} />;
}
