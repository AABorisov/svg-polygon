import { CoordinatePair } from "../grammars/svgpath.types";

export const radian = (ux: number, uy: number, vx: number, vy: number): number => {
  var dot = ux * vx + uy * vy;
  var mod = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
  var rad = Math.acos(dot / mod);
  if (ux * vy - uy * vx < 0.0) {
    rad = -rad;
  }
  return rad;
}

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
}

export const getDistance = (p1: CoordinatePair, p2: CoordinatePair): number => {
  return distance(p1[0], p1[1], p2[0], p2[1])
}

export const doubleTriangleArea = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  return Math.abs((x2 - x1) * (y1 - py) - (x1 - px) * (y2 - y1))
}

export const triangleArea = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  return doubleTriangleArea(px, py, x1, y1, x2, y2) / 2
}

export const distanceToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dLine = distance(x1, y1, x2, y2)

  return doubleTriangleArea(px, py, x1, y1, x2, y2) / dLine
}

export const getDistanceToLine = (p: CoordinatePair, l: [CoordinatePair, CoordinatePair]): number => {
  const [px, py] = p, [[x1, y1], [x2, y2]] = l
  return distanceToLine(px, py, x1, y1, x2, y2)
}


//  .x1y1  .x3y3
//   \    /
//    \  /
//     \/ pxpy
//     /\  
//    /  \
//   /    \ 
//  .x4y4  .x2y2
export const lineIntersect = (
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): [number, number] => {
  const px = (
    (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)
  ) / (
      (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    )
  const py = (
    (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)
  ) / (
      (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    )

  return [px, py]
}