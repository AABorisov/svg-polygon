import type { CoordinatePair } from "../grammars/svgpath.types";
import type { CenterParamObject } from "./svgArcToCenter";


export const calcEllipsePoint = (centerObject: CenterParamObject, theta: number): CoordinatePair => {
  const { cx, cy, rx, ry, phi } = centerObject
  const { abs, sin, cos } = Math;

  const M = abs(rx) * cos(theta),
    N = abs(ry) * sin(theta);

  return [
    cx + cos(phi) * M - sin(phi) * N,
    cy + sin(phi) * M + cos(phi) * N
  ];
}

export const bezierQuadCurve = (ps: number[], t: number) => {
  return (1 - t) ** 2 * ps[0]
    + 2 * (1 - t) * t * ps[1]
    + t ** 2 + ps[2]
}

export const bezierCubicCurve = (ps: number[], t: number) => {
  return (1 - t) ** 3 * ps[0]
    + 3 * (1 - t) ** 2 * t * ps[1]
    + 3 * (1 - t) * t ** 2 * ps[2]
    + t ** 3 * ps[3]
}

export type TCurveFunc = (ps: number[], t: number) => number

export const calcCurvePoint = (points: CoordinatePair[], curveFunc: TCurveFunc) => {
  const pointX = points.map(p => p[0])
  const pointY = points.map(p => p[1])
  return (t: number): CoordinatePair => {
    return [curveFunc(pointX, t), curveFunc(pointY, t)]
  }
}