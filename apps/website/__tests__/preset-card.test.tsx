import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import PresetCard from "@/components/ptz/PresetCard";

vi.mock("next/image", () => ({
  default: ({ src }: { src: string }) => <span data-image-src={src} />,
}));
describe("preset card safety", () => {
  it("never renders a load or copy action unless explicitly permitted", () => {
    const html = renderToStaticMarkup(
      <PresetCard title="Archived home" image={null} onLoad={() => {}} />,
    );
    expect(html).toContain("Archived home");
    expect(html).not.toContain("Load preset");
    expect(html).not.toContain("Copy command");
  });
  it("allows a verified source preset without inventing a photo", () => {
    const html = renderToStaticMarkup(
      <PresetCard title="Home" image={null} onLoad={() => {}} canLoad />,
    );
    expect(html).toContain("Load preset");
    expect(html).toContain("No image available");
    expect(html).not.toContain("data-image-src");
  });
  it("labels an historical image independently of load permission", () => {
    const html = renderToStaticMarkup(
      <PresetCard
        title="Home"
        image={{ src: "https://example.com/old.png", width: 300, height: 169 }}
        imageProvenance="legacy"
        onLoad={() => {}}
        canLoad
      />,
    );
    expect(html).toContain("Legacy image");
    expect(html).toContain("Load preset");
  });
});
