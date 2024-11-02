const channels = 3;
const sigBits = 5;

type Range = [number, number];
const cut = (
  vboxes: {
    population: number;
    ranges: [Range, Range, Range];
    product: number | null;
  }[],
  histogram: number[],
  compareFn: Parameters<(typeof vboxes)["sort"]>[0],
) => {
  if (vboxes.length > 1) {
    vboxes.sort(compareFn);
  }

  const { ranges } = vboxes.pop()!;

  const enum Channel {
    Red,
    Green,
    Blue,
  }

  let maxRange = Channel.Red;
  let maxSpan = ranges[maxRange][1] - ranges[maxRange][0];
  for (let i = Channel.Green; i < ranges.length; i++) {
    const range = ranges[i];

    const span = range[1] - range[0];
    if (span > maxSpan) {
      maxSpan = span;
      maxRange = i;
    }
  }

  let total = 0;
  const partialSums = [];
  const iChannel = maxRange;
  const jChannel = ((iChannel + 1) % channels) as Channel;
  const kChannel = ((jChannel + 1) % channels) as Channel;
  const [iStart, iEnd] = ranges[iChannel];
  const [jStart, jEnd] = ranges[jChannel];
  const [kStart, kEnd] = ranges[kChannel];
  for (let i = iStart; i <= iEnd; i++) {
    let sum = 0;

    const iIdx = i << (sigBits * (2 - iChannel));

    for (let j = jStart; j <= jEnd; j++) {
      const jIdx = iIdx + (j << (sigBits * (2 - jChannel)));

      for (let k = kStart; k <= kEnd; k++) {
        const histogramIdx = jIdx + (k << (sigBits * (2 - kChannel)));

        sum += histogram[histogramIdx] ?? 0;
      }
    }

    total += sum;

    partialSums[i] = total;
  }

  const partialDiffs = partialSums.map((sum) => total - sum);

  for (let i = iStart; i <= iEnd; i++) {
    if (partialSums[i]! > total / 2) {
      let median: number;

      const left = i - iStart;
      const right = iEnd - i;
      if (left <= right) median = Math.min(iEnd - 1, ~~(i + right / 2));
      else median = Math.max(iStart, ~~(i - 1 - left / 2));

      while (partialSums[i] === 0) {
        median++;
      }

      let diff = partialDiffs[median];
      while (diff === 0 && partialSums[median - 1]) {
        median--;

        diff = partialDiffs[median];
      }

      vboxes.push(
        {
          population: partialSums[median]!,
          ranges: ranges.map((range, i) =>
            i === maxRange ? [range[0], median] : [...range],
          ) as [Range, Range, Range],
          product: null,
        },
        {
          population: partialDiffs[median]!,
          ranges: ranges.map((range, i) =>
            i === maxRange ? [median + 1, range[1]] : [...range],
          ) as [Range, Range, Range],
          product: null,
        },
      );

      break;
    }
  }
};

// Compresses each channel to 5 bits and stores each pixel in a histogram.
// Creates a vbox that has the range of each channel as the length of each dimension.
// Cuts the vbox with the largest population at the median point
// along the longest dimension three times.
// Cuts the vbox with the largest product of its volume and population.
// Returns the average color of the vbox with the largest product.
export const mmcq = (data: Uint8ClampedArray) => {
  const histogram = Array(1 << (sigBits * channels));

  // RGBA
  const channelsInData = 4;
  const blockSize = channelsInData * 10;
  let population = 0;
  const ranges = Array.from({ length: channels }, () => [
    (1 << sigBits) - 1,
    0,
  ]) as [Range, Range, Range];
  for (let i = 0; i < data.length; i += blockSize) {
    if (data[i + (channelsInData - 1)]! < 128) continue;

    let histogramIdx = 0;
    for (let j = 0; j < channels; j++) {
      const value = data[i + j]! >> (8 - sigBits);

      if (value < ranges[j]![0]) {
        ranges[j]![0] = value;
      }
      if (value > ranges[j]![1]) {
        ranges[j]![1] = value;
      }

      histogramIdx += value << (sigBits * (2 - j));
    }

    histogram[histogramIdx] = (histogram[histogramIdx] ?? 0) + 1;
    population++;
  }

  const vboxes: Parameters<typeof cut>[0] = [
    { population, ranges, product: null },
  ];

  for (let i = 0; i < 3; i++) {
    cut(vboxes, histogram, (a, b) => a.population - b.population);
  }

  for (let i = 0; i < vboxes.length; i++) {
    const vbox = vboxes[i]!;

    vbox.product = vbox.ranges.reduce(
      (prev, curr) => prev * (curr[1] - curr[0] + 1),
      vbox.population,
    );
  }

  cut(vboxes, histogram, (a, b) => a.product! - b.product!);

  let dominantColorVbox = vboxes[0]!;
  for (let i = 1; i < vboxes.length; i++) {
    const vbox = vboxes[i]!;

    if (vbox.product === null) {
      vbox.product = vbox.ranges.reduce(
        (prev, curr) => prev * (curr[1] - curr[0] + 1),
        vbox.population,
      );
    }

    if (vbox.product > dominantColorVbox.product!) {
      dominantColorVbox = vbox;
    }
  }

  const [rRange, gRange, bRange] = dominantColorVbox.ranges;

  const dominantColor = [0, 0, 0];
  let total = 0;
  for (let r = rRange[0]; r <= rRange[1]; r++) {
    const rIdx = r << (sigBits * 2);
    for (let g = gRange[0]; g <= gRange[1]; g++) {
      const gIdx = rIdx + (g << sigBits);
      for (let b = bRange[0]; b <= bRange[1]; b++) {
        const histogramIdx = gIdx + b;
        const amt = histogram[histogramIdx] ?? 0;

        if (amt > 0) {
          total += amt;

          dominantColor[0] += amt * (r + 0.5);
          dominantColor[1] += amt * (g + 0.5);
          dominantColor[2] += amt * (b + 0.5);
        }
      }
    }
  }
  if (total > 0) {
    for (let i = 0; i < dominantColor.length; i++) {
      dominantColor[i] = ~~((dominantColor[i]! << (8 - sigBits)) / total);
    }
  } else {
    for (let i = 0; i < dominantColorVbox.ranges.length; i++) {
      const range = dominantColorVbox.ranges[i]!;
      dominantColor[i] = ~~(((range[0] + range[1] + 1) << (8 - sigBits)) / 2);
    }
  }

  return dominantColor;
};
