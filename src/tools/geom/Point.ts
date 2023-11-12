import { TPoint, ArrPoint } from "../point"
import { getDistance } from "./geom"

/**
 * Point: Point or ArrPoint
 * 
 * construct: (Point | ArrPoint)
 * 
 * functions:
 *   getPoint: Point
 *   getArrPoint: ArrPoint
 *   getDistance (p: Point): number { return gl.getDistance(self.Point, p) }
 */

class Point {
  _x: number
  _y: number

  constructor(x: number, y: number) {
    this._x = x
    this._y = y
  }
  static from(point: TPoint | ArrPoint) {
    if (Array.isArray(point)) {
      const [x, y] = point
      return new Point(x, y)
    } else {
      const { x, y } = point
      return new Point(x, y)
    }
  }

  get point(): TPoint {
    return this.getPoint()
  }

  get arrPoint(): ArrPoint {
    return this.getArrPount()
  }

  get x(): number {
    return this._x
  }
  get y(): number {
    return this._y
  }

  getPoint(): TPoint {
    return { x: this._x, y: this._y }
  }
  getArrPount(): ArrPoint {
    return [this._x, this._y]
  }

  getDistance(p: Point): number {
    return getDistance(this.arrPoint, p.arrPoint)
  }
}

export default Point