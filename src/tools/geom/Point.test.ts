import { ArrPoint, TPoint } from "../point"
import Point from "./Point"

const arrPoint: ArrPoint = [1, 2]
const tPoint: TPoint = { x: 1, y: 3}
describe('Point test', () => {
  it('from arrPoint', () => {
    const point = Point.from(arrPoint)
    expect(point.x).toBe(arrPoint[0])
    expect(point.y).toBe(arrPoint[1])
    expect(point.arrPoint).toStrictEqual(arrPoint)
  })

  it('from tPoint', () => {
    const point = Point.from(tPoint)
    expect(point.x).toBe(tPoint.x)
    expect(point.y).toBe(tPoint.y)
    expect(point.point).toStrictEqual(tPoint)
  })

  it('distance', () => {
    const point1 = Point.from(arrPoint)
    const point2 = Point.from(tPoint)

    expect(point1.getDistance(point2)).toBe(1)
  })
})