import { spawnSync } from "node:child_process";
import { unlink } from "node:fs/promises";

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
  presets: z.array(z.string()),
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

const processCamera = (project: Project, camera: UpstreamPresets) => {
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

  const presets = new Set(camera.presets);
  for (const preset of camera.presets) {
    const existing = obj.getProperty(preset);
    if (existing) continue;

    // Add a new property for the preset
    obj.addPropertyAssignment({
      name: preset,
      initializer: (writer) => {
        writer.block(() => {
          writer.writeLine(`description: "${preset}",`);
          writer.writeLine(`image: ${preset},`);
        });
      },
    });

    // Add a new import for the preset image at the top of the file
    file.addImportDeclaration({
      moduleSpecifier: `@/assets/presets/${name}/${preset}.png`,
      defaultImport: preset,
    });

    // TODO: Download and save the preset image locally
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

  return { removed };
};

const main = async () => {
  const project = new Project();

  // Update all the preset data files for each camera from the upstream API
  const upstreamPresets = await getUpstreamPresets();
  const { removed } = upstreamPresets
    .map((camera) => processCamera(project, camera))
    .reduce<{ removed: string[] }>(
      (acc, curr) => {
        if (curr) {
          acc.removed.push(...curr.removed);
        }
        return acc;
      },
      { removed: [] },
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
