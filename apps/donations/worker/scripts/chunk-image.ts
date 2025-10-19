import fs from "node:fs";
import { join } from "node:path";
import * as jpeg from "jpeg-js";

const GRID_COLUMNS = 200;
const GRID_ROWS = 50;
const GRID_ASPECT_RATIO = GRID_COLUMNS / GRID_ROWS;

const path = "../pixels.secret.jpeg";
const image = fs.readFileSync(join(__dirname, path));
const { data, width, height } = jpeg.decode(image, { useTArray: true });
const aspectRatio = width / height;

if (aspectRatio !== GRID_ASPECT_RATIO) {
  throw new Error(
    `Aspect ratio ${aspectRatio} is not equal to ${GRID_ASPECT_RATIO}. The image must have the same aspect ratio as the grid.`,
  );
}

const gridSquareWidth = width / GRID_COLUMNS;
const gridSquareHeight = height / GRID_ROWS;

console.log(`Image dimensions: ${width}x${height}`);
console.log(`Grid square dimensions: ${gridSquareWidth}x${gridSquareHeight}`);

if (gridSquareWidth !== gridSquareHeight) {
  throw new Error(
    `Grid square width ${gridSquareWidth} is not equal to grid square height ${gridSquareHeight}. The image must have the same width and height for each grid square.`,
  );
}

if (!Number.isInteger(gridSquareWidth)) {
  throw new Error(
    `Grid square width ${gridSquareWidth} is not an integer. The image dimensions must be evenly divisible by the grid dimensions.`,
  );
}

// For each grid square, encode the data into a base64 string
const grid = {
  columns: GRID_COLUMNS,
  rows: GRID_ROWS,
  size: gridSquareWidth,
  squares: {} as Record<string, string>,
};

for (let y = 0; y < GRID_ROWS; y++) {
  for (let x = 0; x < GRID_COLUMNS; x++) {
    // Extract the grid square pixel data
    const gridSquareData = new Uint8ClampedArray(
      gridSquareWidth * gridSquareHeight * 4,
    );

    for (let sy = 0; sy < gridSquareHeight; sy++) {
      for (let sx = 0; sx < gridSquareWidth; sx++) {
        // Calculate the source position in the original image
        const sourceX = x * gridSquareWidth + sx;
        const sourceY = y * gridSquareHeight + sy;
        const sourceIndex = (sourceY * width + sourceX) * 4;

        // Calculate the target position in the grid square
        const targetIndex = (sy * gridSquareWidth + sx) * 4;

        // Copy RGBA values
        gridSquareData[targetIndex] = data[sourceIndex]; // R
        gridSquareData[targetIndex + 1] = data[sourceIndex + 1]; // G
        gridSquareData[targetIndex + 2] = data[sourceIndex + 2]; // B
        gridSquareData[targetIndex + 3] = data[sourceIndex + 3]; // A
      }
    }

    const encoded = btoa(String.fromCharCode(...gridSquareData));
    grid.squares[`${x}:${y}`] = encoded;
  }
}

fs.writeFileSync(
  join(__dirname, "../src/grid.json"),
  JSON.stringify(grid, null, 2),
);
