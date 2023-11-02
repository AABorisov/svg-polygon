export type ArrPoint = [number, number];

export type Point = { x: number; y: number };
export const toArrPoints = (points: Point[]): ArrPoint[] =>
  points.map(({ x, y }) => [x, y]);
export const fromArrPoints = (points: ArrPoint[]): Point[] =>
  points.map(([x, y]) => ({ x, y }));
// const tags = ['polygon'];
