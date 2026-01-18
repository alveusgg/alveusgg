import { spawnSync } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { Project, StructureKind, SyntaxKind } from "ts-morph";
import { z } from "zod";

const upstreamCameraMap: Record<string, string> = {
  chickenin: "chickenindoor",
  pushcrunch: "pushpopcrunch",
  pushinptz: "pushpopindoor",
  parrots: "littles",
  macaw: "macaws",
};

const upstreamPresetsSchema = z.object({
  name: z.string().toLowerCase(),
  presets: z.array(
    z.object({
      name: z.string(),
      modified: z.iso
        .datetime()
        .transform((str) => new Date(str))
        .nullable(),
    }),
  ),
});

type UpstreamPresets = z.infer<typeof upstreamPresetsSchema>;

const getUpstreamPresets = async () => {
  const response = await fetch("https://ptz.app/api/presets");
  if (!response.ok) {
    throw new Error(
      `Failed to fetch upstream presets: ${response.status} ${response.statusText}`,
    );
  }

  const data = await response.json();
  return z.array(upstreamPresetsSchema).parse(data);
};

const getUpstreamImage = async (camera: string, preset: string) => {
  const response = await fetch(
    `https://ptz.app/images/button-img/${encodeURIComponent(camera)}/${encodeURIComponent(preset)}.png`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch upstream image for ${camera} ${preset}: ${response.status} ${response.statusText}`,
    );
  }

  return response.arrayBuffer();
};

const processCamera = async (project: Project, camera: UpstreamPresets) => {
  const name = upstreamCameraMap[camera.name] || camera.name;
  const file = project.addSourceFileAtPathIfExists(
    `src/data/presets/${name}.ts`,
  );
  if (!file) {
    console.error(`No preset file found for camera ${name}`);
    return;
  }

  const obj = file
    .getVariableDeclaration(`${name}Presets`)
    ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
  if (!obj) {
    console.error(`No presets object found for camera ${name}`);
    return;
  }

  const presets = new Set(camera.presets.map((p) => p.name));
  const added: [string, ArrayBuffer][] = [];
  for (const preset of camera.presets) {
    // Ignore any temporary presets
    if (/^te?mp/i.test(preset.name) || /te?mp$/i.test(preset.name)) {
      console.warn(
        `Ignoring temporary preset ${preset.name} for camera ${name}`,
      );
      continue;
    }

    // Ignore any presets with an invalid modified date
    if (!preset.modified) {
      console.warn(
        `Ignoring preset ${preset.name} for camera ${name} with invalid modified date`,
      );
      continue;
    }

    const existing = obj.getProperty(preset.name);
    if (existing) {
      // Try to find a modified comment within the existing preset
      const modified = existing
        .getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia)
        .map((comment) => {
          const text = comment.getText();
          if (!text.startsWith("// modified: ")) return null;

          const dateStr = text.replace("// modified: ", "").trim();
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return null;

          return {
            comment,
            date,
          };
        })
        .find((date) => date !== null);

      // If the modified date is the same or newer, skip updating this preset
      if (modified && modified.date >= preset.modified) {
        continue;
      }
    }

    try {
      // Download the preset image from the upstream API and add an import for it
      // Intentionally use the original camera name here for the upstream API, not the mapped name
      const data = await getUpstreamImage(camera.name, preset.name);
      const imp = file.addImportDeclaration({
        moduleSpecifier: `@/assets/presets/${name}/${preset.name}.png`,
        defaultImport: preset.name,
      });
      added.push([imp.getModuleSpecifierValue(), data]);

      // Get the old description if it exists
      const description = existing
        ? existing
            .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
            .getPropertyOrThrow("description")
            .getFirstChildByKindOrThrow(SyntaxKind.StringLiteral)
            .getText()
        : JSON.stringify(preset.name);

      // Add a new property for the preset
      obj.addPropertyAssignment({
        name: preset.name,
        initializer: (writer) => {
          writer.block(() => {
            writer.writeLine(`description: ${description},`);
            writer.writeLine(`image: ${preset.name},`);
            writer.writeLine(`// modified: ${preset.modified?.toISOString()}`);
          });
        },
      });

      // Remove the old preset property if it exists (and remove the duplicate import we just added)
      if (existing) {
        existing.remove();
        imp.remove();
      }
    } catch (error) {
      // Log an error on failure but continue processing other presets
      // We should only hit this if the upstream API does not have an image for the preset
      console.error(
        `Failed to process preset ${preset.name} for camera ${name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Sort the presets alphabetically
  obj.addProperties(
    obj
      .getProperties()
      .map((prop) => {
        const struct = prop.getStructure();
        prop.remove();

        // Only recreate if this is a PropertyAssignment for a preset that still exists
        // We always want to keep the `home` preset even if the upstream doesn't have it
        return struct.kind === StructureKind.PropertyAssignment &&
          (presets.has(struct.name) || struct.name === "home")
          ? struct
          : null;
      })
      .filter((prop) => prop !== null)
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())),
  );

  // Hoist the home preset to the top if it exists
  const homePreset = obj
    .getProperty("home")
    ?.asKind(SyntaxKind.PropertyAssignment);
  if (homePreset) {
    obj.insertProperty(0, homePreset.getStructure());
    homePreset.remove();
  }

  // Remove any imports that are no longer used
  const removed = file
    .getImportDeclarations()
    .map((imp) => {
      const importDefault = imp.getDefaultImport();
      if (
        !importDefault ||
        importDefault
          .findReferencesAsNodes()
          .filter((ref) => ref !== importDefault).length > 0
      ) {
        return null;
      }

      const importPath = imp.getModuleSpecifierValue();
      imp.remove();
      return importPath;
    })
    .filter((imp) => imp !== null);

  return { added, removed };
};

const main = async () => {
  const project = new Project();

  // Update all the preset data files for each camera from the upstream API
  const upstreamPresets = await getUpstreamPresets();
  const { added, removed } = await Promise.all(
    upstreamPresets.map((camera) => processCamera(project, camera)),
  ).then((results) =>
    results.reduce<{ added: [string, ArrayBuffer][]; removed: string[] }>(
      (acc, curr) => {
        if (curr) {
          acc.added.push(...curr.added);
          acc.removed.push(...curr.removed);
        }
        return acc;
      },
      { added: [], removed: [] },
    ),
  );

  // Warn about any local preset files that don't have a corresponding upstream camera
  const cameras = new Set(
    upstreamPresets.map(
      (camera) => upstreamCameraMap[camera.name] || camera.name,
    ),
  );
  project.addSourceFilesAtPaths("src/data/presets/*.ts").forEach((file) => {
    if (!cameras.has(file.getBaseNameWithoutExtension())) {
      console.warn(
        `No upstream camera found for preset file ${file.getBaseName()}`,
      );
    }
  });

  // Save all the modified files and run Prettier on them
  const modified = project.getSourceFiles().filter((file) => !file.isSaved());
  if (!modified.length) {
    console.log("No changes to presets");
    return;
  }
  await project.save();
  const prettier = spawnSync("pnpm", [
    "exec",
    "prettier",
    "--write",
    ...modified.map((file) => file.getFilePath()),
  ]);
  if (prettier.status !== 0) {
    console.error(
      `Prettier failed:\n${prettier.output.map((o) => o?.toString() || "").join("")}`,
    );
    process.exit(prettier.status || 1);
  }

  // Write all the newly imported images to disk
  await Promise.all(
    added.map(async ([importPath, data]) => {
      const path =
        project.getDirectoryOrThrow("src").getPath() +
        importPath.replace("@/", "/");
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, Buffer.from(data));
    }),
  );

  // Clean up any imported images that are no longer used
  await Promise.all(
    removed.map((importPath) =>
      unlink(
        project.getDirectoryOrThrow("src").getPath() +
          importPath.replace("@/", "/"),
      ),
    ),
  );
};

await main();
