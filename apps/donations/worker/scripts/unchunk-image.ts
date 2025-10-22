import fs from "node:fs";
import { join } from "node:path";
import * as jpeg from "jpeg-js";

// Read the grid data
const gridPath = join(__dirname, "../src/grid.json");
const gridData = JSON.parse(fs.readFileSync(gridPath, "utf8"));

const { columns, rows, size, squares } = gridData;

console.log(`Grid dimensions: ${columns}x${rows}`);
console.log(`Grid square size: ${size}x${size}`);

// Calculate image dimensions
const imageWidth = columns * size;
const imageHeight = rows * size;

console.log(`Image dimensions: ${imageWidth}x${imageHeight}`);

// Create a new Uint8ClampedArray for the image data
const imageData = new Uint8ClampedArray(imageWidth * imageHeight * 4);

// Reconstruct the image by placing each grid square back into position
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < columns; x++) {
    const key = `${x}:${y}`;
    const encodedData = squares[key];

    if (!encodedData) {
      console.warn(`Missing data for grid square ${key}`);
      continue;
    }

    // Decode the base64 data back to pixel data
    const decodedData = Uint8ClampedArray.from(atob(encodedData), (c) =>
      c.charCodeAt(0),
    );

    // Place the decoded data into the correct position in the image
    for (let sy = 0; sy < size; sy++) {
      for (let sx = 0; sx < size; sx++) {
        const sourceIndex = (sy * size + sx) * 4;
        const targetIndex =
          ((y * size + sy) * imageWidth + (x * size + sx)) * 4;

        // Copy RGBA values
        imageData[targetIndex] = decodedData[sourceIndex]; // R
        imageData[targetIndex + 1] = decodedData[sourceIndex + 1]; // G
        imageData[targetIndex + 2] = decodedData[sourceIndex + 2]; // B
        imageData[targetIndex + 3] = decodedData[sourceIndex + 3]; // A
      }
    }
  }
}

// Create the JPEG image
const image = {
  data: imageData,
  width: imageWidth,
  height: imageHeight,
};

// Encode as JPEG
const jpegData = jpeg.encode(image, 100);

// Write the reconstructed image
const outputPath = join(__dirname, "../reconstructed-image.jpeg");
fs.writeFileSync(outputPath, jpegData.data);

console.log(`Reconstructed image saved to: ${outputPath}`);
