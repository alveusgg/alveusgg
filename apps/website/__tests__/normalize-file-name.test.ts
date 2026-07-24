import { expect, it } from "vitest";

import { normalizeFileName } from "@/utils/files";

it("removes unsafe characters and diacritics, keeps extension", () => {
  expect(normalizeFileName("fäncy_fïle-näme.jpg")).toBe("fancy_file-name.jpg");
  expect(normalizeFileName("übermäßig_kompliziert.png")).toBe(
    "ubermaig_kompliziert.png",
  );
  expect(normalizeFileName("straße-ß-äöü.gif")).toBe("strae--aou.gif");
  expect(normalizeFileName("áéíóúñç.jpeg")).toBe("aeiounc.jpeg");
});

it("removes special characters and trims base name to 30 chars", () => {
  expect(
    normalizeFileName(
      "this_is_a_very_long_filename_with_extra_characters_and_numbers1234567890.png",
    ),
  ).toBe("this_is_a_very_long_filename_w.png");
  expect(normalizeFileName("a!@#$%^&*()_+=file.txt")).toBe("a_file.txt");
  expect(normalizeFileName("file with spaces and !@#$.pdf")).toBe(
    "filewithspacesand.pdf",
  );
});

it("trims base name to custom char length", () => {
  expect(
    normalizeFileName(
      "this_is_a_very_long_filename_with_extra_characters_and_numbers1234567890.png",
      10,
    ),
  ).toBe("this_is_a_.png");
});

it("handles files without extension", () => {
  expect(normalizeFileName("noextensionfilename")).toBe("noextensionfilename");
  expect(normalizeFileName("übermäßig_kompliziert")).toBe(
    "ubermaig_kompliziert",
  );
});

it("extension only names become file or file.ext", () => {
  expect(normalizeFileName(".env")).toBe("file.env");
  expect(normalizeFileName("..dotfile")).toBe("file.dotf");
  expect(normalizeFileName("...multiple.dotfile")).toBe("multiple.dotf");
  expect(normalizeFileName(".hidden.txt")).toBe("hidden.txt");
  expect(normalizeFileName(".!!!")).toBe("file");
});

it("handles files with multiple dots as single extension", () => {
  expect(normalizeFileName("archive.tar.gz")).toBe("archivetar.gz");
  expect(
    normalizeFileName(
      "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.txt",
    ),
  ).toBe("abcdefghijklmnopqrstuvwxyz.txt");
});

it("returns 'file' if name is empty after cleaning", () => {
  expect(normalizeFileName("!@#$%^&*().jpg")).toBe("file.jpg");
  expect(normalizeFileName(".!!!")).toBe("file");
});

it("truncates extension to 4 chars", () => {
  expect(normalizeFileName("filename.abcdefg")).toBe("filename.abcd");
  expect(normalizeFileName("über.äöüß")).toBe("uber.aou");
});
