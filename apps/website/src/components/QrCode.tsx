/*
 * Adapted from react.qrcode:
 * -----------------------------------
 *
 * ISC License
 *
 * Copyright (c) 2015, Paul O’Shannessy
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 * OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 *
 * This product bundles QR Code Generator, which is available under a
 * "MIT" license. For details, see src/third-party/qrcodegen.
 */
import type React from "react";
import { useMemo } from "react";

import { QrCode } from "@/third-party/qrcodegen";

type Modules = Array<Array<boolean>>;

function modulesToSvgPath(modules: Modules): string {
  const ops: Array<string> = [];
  modules.forEach(function (row, y) {
    let start: number | null = null;
    row.forEach(function (cell, x) {
      if (!cell && start !== null) {
        // M0 0h7v1H0z injects the space with the move and drops the comma,
        // saving a char per operation
        ops.push(`M${start} ${y}h${x - start}v1H${start}z`);
        start = null;
        return;
      }

      // end of row, clean up or skip
      if (x === row.length - 1) {
        if (!cell) {
          // We would have closed the op above already so this can only mean
          // 2+ light modules in a row.
          return;
        }
        if (start === null) {
          // Just a single dark module.
          ops.push(`M${x},${y} h1v1H${x}z`);
        } else {
          // Otherwise finish the current line.
          ops.push(`M${start},${y} h${x + 1 - start}v1H${start}z`);
        }
        return;
      }

      if (cell && start === null) {
        start = x;
      }
    });
  });
  return ops.join("");
}

export function QRCode({
  children,
  value,
  ...attributes
}: { value: string } & React.SVGAttributes<SVGSVGElement>) {
  const { length, path } = useMemo(() => {
    const modules = QrCode.encodeText(value).getModules();
    return {
      length: modules.length,
      path: modulesToSvgPath(modules),
    };
  }, [value]);

  return (
    <svg viewBox={`0 0 ${length} ${length}`} {...attributes}>
      {children}
      <path fill="currentColor" d={path} shapeRendering="crispEdges" />
    </svg>
  );
}
