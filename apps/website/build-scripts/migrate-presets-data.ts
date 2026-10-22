import { createHash } from "node:crypto";

import {
  Node,
  type ObjectLiteralExpression,
  Project,
  SyntaxKind,
} from "ts-morph";
import { z } from "zod";

import {
  presetCatalogCamera,
  resolveControlCamera,
} from "../src/data/tech/camera-identifiers";
import { positionSchema } from "../src/server/presets/schema";

export const DEFAULT_BASE = "be34b5f30a0feadc0c3dc271b7e45d03f03606e6";
export const DATA_ROOT = "apps/website/src/data/presets/";
export const IMAGE_ROOT = "apps/website/src/assets/presets/";
export const sha256 = (bytes: string | Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

export type LegacyPreset = {
  camera: string;
  name: string;
  description: string;
  position: Record<string, number>;
  modifiedAt: string | null;
  imagePath: string;
  sourceFile: string;
  title: string | null;
  group: string | null;
};
export type LegacyMulti = Omit<LegacyPreset, "position" | "name"> & {
  cameras: string[];
};

function value(object: ObjectLiteralExpression, key: string) {
  const property = object.getProperty(key);
  if (property && Node.isShorthandPropertyAssignment(property))
    return property.getNameNode();
  return property && Node.isPropertyAssignment(property)
    ? property.getInitializerOrThrow()
    : undefined;
}
function literal(node: Node | undefined): string {
  if (!node || !Node.isStringLiteral(node))
    throw new Error("Expected a static string literal in legacy preset data");
  return node.getLiteralValue();
}
function modified(object: ObjectLiteralExpression) {
  const text = object
    .getText()
    .match(/\/\/\s*modified:\s*([^\r\n]+)/)?.[1]
    ?.trim();
  if (!text || text === "null") return null;
  if (!Number.isFinite(Date.parse(text)))
    throw new Error("Invalid legacy modified timestamp");
  return text;
}

export function extractLegacySources(
  sources: { path: string; text: string }[],
) {
  const project = new Project({
    useInMemoryFileSystem: true,
    skipAddingFilesFromTsConfig: true,
  });
  const presets: LegacyPreset[] = [];
  const multis: LegacyMulti[] = [];
  for (const source of sources) {
    const camera = source.path.slice(DATA_ROOT.length).replace(/\.ts$/, "");
    const file = project.createSourceFile(source.path, source.text);
    const imports = new Map(
      file.getImportDeclarations().flatMap((declaration) => {
        const identifier = declaration.getDefaultImport();
        const specifier = declaration.getModuleSpecifierValue();
        return identifier && specifier.startsWith("@/assets/presets/")
          ? [
              [
                identifier.getText(),
                `apps/website/src/${specifier.slice(2)}`,
              ] as const,
            ]
          : [];
      }),
    );
    const cameraObject = file
      .getVariableDeclaration(camera)
      ?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
    const title =
      cameraObject && value(cameraObject, "title")
        ? literal(value(cameraObject, "title"))
        : null;
    const group =
      cameraObject && value(cameraObject, "group")
        ? literal(value(cameraObject, "group"))
        : null;
    for (const object of file.getDescendantsOfKind(
      SyntaxKind.ObjectLiteralExpression,
    )) {
      if (!value(object, "description") || !value(object, "image")) continue;
      const image = value(object, "image");
      if (!image || !Node.isIdentifier(image) || !imports.has(image.getText()))
        throw new Error(`Unresolved legacy image in ${source.path}`);
      const common = {
        camera,
        description: literal(value(object, "description")),
        modifiedAt: modified(object),
        imagePath: imports.get(image.getText())!,
        sourceFile: source.path,
        title,
        group,
      };
      const position = value(object, "position");
      const cameras = value(object, "cameras");
      if (position) {
        if (!Node.isObjectLiteralExpression(position))
          throw new Error("Legacy positions must be static objects");
        const coordinates: Record<string, number> = {};
        for (const property of position.getProperties()) {
          if (!Node.isPropertyAssignment(property))
            throw new Error("Unsupported legacy position property");
          const coordinate = Number(property.getInitializerOrThrow().getText());
          if (!Number.isFinite(coordinate))
            throw new Error("Legacy coordinates must be finite numbers");
          coordinates[property.getName()] = coordinate;
        }
        if (!["pan", "tilt", "zoom"].every((key) => key in coordinates))
          throw new Error("Incomplete legacy PTZ position");
        const parent = object.getParent();
        if (!Node.isPropertyAssignment(parent))
          throw new Error("Expected a named legacy preset");
        const nameNode = parent.getNameNode();
        const name = Node.isStringLiteral(nameNode)
          ? nameNode.getLiteralValue()
          : nameNode.getText();
        presets.push({ ...common, name, position: coordinates });
      } else if (cameras) {
        if (!Node.isArrayLiteralExpression(cameras))
          throw new Error("Expected ordered multi-view cameras");
        multis.push({ ...common, cameras: cameras.getElements().map(literal) });
      } else throw new Error("Unrecognized legacy preset record");
    }
  }
  return { presets, multis };
}

export type LegacyAsset = {
  path: string;
  sha256: string;
  size: number;
  width: number;
  height: number;
  kind: "preset" | "multi" | "orphan";
  presets: LegacyPreset[];
  multis: LegacyMulti[];
};

export function mappingConflicts(presets: LegacyPreset[]) {
  const origins = new Map<string, Set<string>>();
  const names = new Map<string, number>();
  for (const preset of presets) {
    const camera = presetCatalogCamera(preset.camera);
    const sources = origins.get(camera) ?? new Set<string>();
    sources.add(preset.camera);
    origins.set(camera, sources);
    const key = `${camera}/${preset.name}`;
    names.set(key, (names.get(key) ?? 0) + 1);
  }
  return {
    cameras: [...origins]
      .filter(([, sources]) => sources.size > 1)
      .map(([camera, sources]) => ({ camera, sources: [...sources] })),
    names: [...names]
      .filter(([, count]) => count > 1)
      .map(([name, count]) => ({ name, count })),
  };
}

export const controlExportSchema = z.object({
  version: z.literal(1),
  cameras: z.array(
    z.object({
      camera: z.string().min(1),
      presets: z.array(
        z.object({
          name: z.string().min(1).max(100),
          position: positionSchema,
        }),
      ),
    }),
  ),
});
export type ControlExport = z.infer<typeof controlExportSchema>;

export function planControlExport(data: unknown) {
  const source = controlExportSchema.parse(data);
  const known: {
    camera: string;
    sourceCamera: string;
    name: string;
    position: z.infer<typeof positionSchema>;
  }[] = [];
  const unknown: ControlExport["cameras"] = [];
  const names = new Set<string>();
  const cameras = new Map<string, string>();
  for (const entry of source.cameras) {
    const camera = resolveControlCamera(entry.camera);
    if (!camera) {
      unknown.push(entry);
      continue;
    }
    const previous = cameras.get(camera);
    if (previous)
      throw new Error(
        `Conflicting control export aliases: ${previous}, ${entry.camera}`,
      );
    cameras.set(camera, entry.camera);
    for (const preset of entry.presets) {
      const key = `${camera}/${preset.name}`;
      if (names.has(key)) throw new Error(`Duplicate control preset: ${key}`);
      names.add(key);
      known.push({ camera, sourceCamera: entry.camera, ...preset });
    }
  }
  return { source, known, unknown };
}

export function samePTZ(left: unknown, right: unknown) {
  if (!left || !right || typeof left !== "object" || typeof right !== "object")
    return false;
  return (["pan", "tilt", "zoom"] as const).every(
    (field) =>
      field in left &&
      field in right &&
      Reflect.get(left, field) === Reflect.get(right, field),
  );
}

export function controlImportPatch(
  existing: {
    provenance: string;
    position: unknown;
    imageProvenance: string | null;
    fileStorageObjectId: string | null;
  } | null,
  position: z.infer<typeof positionSchema>,
) {
  // Captures, current website edits and previous authoritative imports are immutable
  // to bootstrap reruns. A later reconciliation must use normal website commands.
  if (existing && existing.provenance !== "legacy") return null;
  const keepImage =
    existing?.imageProvenance === "legacy" &&
    samePTZ(existing.position, position);
  return {
    position,
    provenance: "control-api-import",
    imageProvenance: keepImage ? "legacy" : null,
    fileStorageObjectId: keepImage ? existing.fileStorageObjectId : null,
    capturedAt: null,
  };
}
