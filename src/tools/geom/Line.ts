import { TPoint, ArrPoint } from "../point"
import { getDistance, getDistanceToLine } from "./geom"
import Point from "./Point"


/**
 * Line:
 * Points: Point[2]
 * getters:
 *   get distance: gl.distance(p1, p2)
 *   get dx: p2.x - p1.x
 *   get dy: p2.y - p1.y
 * 
 * functions:
 *   distanceToPoint(p: Point): number { gl.getDistanceToLine(p, self.l)}
 *   intersect(l: Line): Point | false { gl.intersect(self.l, l)  }
 */
class Line {
  _p1: Point
  _p2: Point
  _dx: number
  _dy: number
  _distance: number = null

  constructor(p1: Point, p2: Point) {
    this._p1 = p1
    this._p2 = p2
  }
  static from(p1: TPoint | ArrPoint, p2: TPoint | ArrPoint) {
    return new Line(Point.from(p1), Point.from(p2))
  }

  get p1() {
    return this._p1
  }
  get p2() {
    return this._p2
  }
  get l(): [Point, Point] {
    return [this.p1, this.p2]
  }

  get arrPoints(): [ArrPoint, ArrPoint] {
    return [this.p1.arrPoint, this.p2.arrPoint]
  }

  get dx() {
    if (this._dx === null) {
      this._dx = this.p2.x - this.p1.x
    }
    return this._dx
  }

  get dy() {
    if (this._dy === null) {
      this._dy = this.p2.y - this.p1.y
    }
    return this._dy
  }

  get distance() {
    if (this._distance === null) {
      this._distance = this.p1.getDistance(this.p2)
    }
    return this._distance
  }

  distanceToPoint(p: Point): number {
    return getDistanceToLine(p.arrPoint, this.arrPoints)
  }

  intersect(l: Line): Point | false {
    return false
  }
}

export default Line