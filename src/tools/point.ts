
/**
 * Types:
 *   Point: { x: number, y: number }
 *   ArrPoint: [ x: number, y: number ]
 */

export type ArrPoint = [x: number, y: number];

export type TPoint = { x: number; y: number };
export const toArrPoints = (points: TPoint[]): ArrPoint[] =>
  points.map(({ x, y }) => [x, y]);
export const fromArrPoints = (points: ArrPoint[]): TPoint[] =>
  points.map(([x, y]) => ({ x, y }));
// const tags = ['polygon'];
