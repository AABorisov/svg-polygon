import { TPoint, ArrPoint } from "../point"

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

  getDist2(p: Point): number {
    return (this.x - p.x) ** 2 + (this.y - p.y) ** 2
  }

  getDistance(p: Point): number {
    return Math.sqrt(this.getDist2(p))
  }
}

export default Point