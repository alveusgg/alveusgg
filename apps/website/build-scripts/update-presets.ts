import { spawnSync } from "node:child_process";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  Project,
  StructureKind,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph";
import { z } from "zod";

import { sentenceToTitle } from "../src/utils/string-case";

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
      pan: z.number().optional(),
      tilt: z.number().optional(),
      zoom: z.number().optional(),
    }),
  ),
});

type UpstreamPresets = z.infer<typeof upstreamPresetsSchema>;

const getUpstreamPresets = async () => {
  const response = await fetch("https://ptz.app/api/presets-ext");
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

  // Find, or create, the camera object declaration
  let objCamera = file
    .getVariableDeclaration(name)
    ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
  if (!objCamera) {
    objCamera = file
      .addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name,
            initializer: (writer) => {
              writer.block(() => {
                writer.writeLine(`title: "${sentenceToTitle(name)}",`);
                writer.writeLine(`group: "${name}",`);
                writer.writeLine(`presets: ${name}Presets,`);
              });
            },
          },
        ],
      })
      .getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    file.addExportAssignment({
      isExportEquals: false,
      expression: name,
    });
  }

  // Find, or create, the default export assignment for the camera object
  let exportAssignment = file.getExportAssignments()[0];
  if (!exportAssignment) {
    exportAssignment = file.addExportAssignment({
      isExportEquals: false,
      expression: name,
    });
  } else {
    exportAssignment.setExpression(name);
  }

  // Ensure the camera object and the export are placed at the end of the file, with a linebreak between them
  objCamera.appendWhitespace((writer) => writer.newLine().newLine());
  objCamera
    .getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement)
    .setOrder(file.getStatements().length - 1);
  exportAssignment.appendWhitespace((writer) => writer.newLine().newLine());
  exportAssignment.setOrder(file.getStatements().length - 1);

  // Find, or create, the presets object declaration
  let objPresets = file
    .getVariableDeclaration(`${name}Presets`)
    ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
  if (!objPresets) {
    objPresets = file
      .addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: `${name}Presets`,
            type: "Record<string, Preset>",
            initializer: (writer) => {
              writer.block();
            },
          },
        ],
      })
      .getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);

    // Add an import for the Preset type if it doesn't already exist
    file.addImportDeclaration({
      isTypeOnly: true,
      moduleSpecifier: "../tech/cameras.types",
      namedImports: ["Preset"],
    });
  }

  // Ensure the presets object is placed at the top of the file, before any other code except imports
  objPresets.appendWhitespace((writer) => writer.newLine().newLine());
  objPresets
    .getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement)
    .setOrder(file.getImportDeclarations().length);

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

    // Try to find an existing entry for the preset
    const existing = objPresets.getProperty(preset.name);
    const modified = existing
      ?.getDescendantsOfKind(SyntaxKind.SingleLineCommentTrivia)
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

    try {
      // If we don't have a modified date, or the upstream is newer, download the image
      if (!modified || modified.date < preset.modified) {
        // Download the preset image from the upstream API and add an import for it
        // Intentionally use the original camera name here for the upstream API, not the mapped name
        const data = await getUpstreamImage(camera.name, preset.name);
        const imp = file.addImportDeclaration({
          moduleSpecifier: `@/assets/presets/${name}/${preset.name}.png`,
          defaultImport: preset.name,
        });
        added.push([imp.getModuleSpecifierValue(), data]);

        // If there was already an existing entry, we don't need to duplicate the import
        if (existing) {
          imp.remove();
        }
      }

      // Get the old description if it exists
      const description = existing
        ? existing
            .getFirstChildByKindOrThrow(SyntaxKind.ObjectLiteralExpression)
            .getPropertyOrThrow("description")
            .getFirstChildByKindOrThrow(SyntaxKind.StringLiteral)
            .getText()
        : JSON.stringify(preset.name);

      // Add a new property for the preset
      objPresets.addPropertyAssignment({
        name: preset.name,
        initializer: (writer) => {
          writer.block(() => {
            writer.writeLine(`description: ${description},`);
            writer.writeLine(`image: ${preset.name},`);

            if (
              preset.pan !== undefined &&
              preset.tilt !== undefined &&
              preset.zoom !== undefined
            ) {
              writer.writeLine(
                `position: { pan: ${preset.pan}, tilt: ${preset.tilt}, zoom: ${preset.zoom} },`,
              );
            } else {
              console.warn(
                `Preset ${preset.name} for camera ${name} is missing position data`,
              );
            }

            writer.writeLine(`// modified: ${preset.modified?.toISOString()}`);
          });
        },
      });

      // Remove the old preset property if it exists, now that we've used it for the description
      if (existing) {
        existing.remove();
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
  objPresets.addProperties(
    objPresets
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
  const homePreset = objPresets
    .getProperty("home")
    ?.asKind(SyntaxKind.PropertyAssignment);
  if (homePreset) {
    objPresets.insertProperty(0, homePreset.getStructure());
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
