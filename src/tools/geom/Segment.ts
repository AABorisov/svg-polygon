import { TPoint, ArrPoint } from "../point"
import Point from "./Point"

/**
 * Segment:
 * Points: Point[2]
 * getters:
 *   get distance: gl.distance(p1, p2)
 *   get dx: p2.x - p1.x
 *   get dy: p2.y - p1.y
 * 
 * functions:
 *   distanceToPoint(p: Point): number { gl.getDistanceToLine(p, self.l)}
 *   intersect(seg: Segment): Point | false { gl.intersect(self.seg, seg)  }
 */
class Segment {
  _p1: Point
  _p2: Point
  _dx: number = null
  _dy: number = null
  _distance: number = null
  _dist2: number = null

  constructor(p1: Point, p2: Point) {
    this._p1 = p1
    this._p2 = p2
  }
  static from(p1: TPoint | ArrPoint, p2: TPoint | ArrPoint) {
    return new Segment(Point.from(p1), Point.from(p2))
  }
  static fromSegment(s: [TPoint, TPoint] | [ArrPoint, ArrPoint]) {
    return Segment.from(s[0], s[1])
  }

  get p1() {
    return this._p1
  }
  get p2() {
    return this._p2
  }
  get seg(): [Point, Point] {
    return [this.p1, this.p2]
  }

  get points(): [TPoint, TPoint] {
    return [this.p1.point, this.p2.point]
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

  get dist2() {
    if (this._dist2 === null) {
      this._dist2 = this.dx ** 2 + this.dy ** 2
    }
    return this._dist2
  }

  /**
   * Tangent Point to segment. It can be projection to over line, if isProjection = true
   * https://paulbourke.net/geometry/pointlineplane/
   * 
   * @param p Point
   * @param isProjection number
   * @returns Point
   */
  getTangentPoint(p: Point, isProjection: boolean = false): Point {
    if (this.dist2 === 0) {
      return this.p1
    }

    let t = ((p.x - this.p1.x) * this.dx + (p.y - this.p1.y) * this.dy) / this.dist2
    if (!isProjection) {
      t = Math.max(0, Math.min(1, t))
    }
    const tangentPoint = Point.from({
      x: this.p1.x + t * this.dx,
      y: this.p1.y + t * this.dy
    })

    return tangentPoint
  }

  distanceToPoint(p: Point, isProjection: boolean = false): number {
    const tangentPoint = this.getTangentPoint(p, isProjection);

    return p.getDistance(tangentPoint)
  }

  /**
   * Two segments are parallel if they have same slopes `dx / dy`
   * 
   * @param seg Segment
   * @returns boolean
   */
  isParallel(seg: Segment): boolean {
    return this._denominator(seg) === 0
  }

  // if det < 0 counter clock wise
  // if det > 0 clock wise
  // if det == 0 collinear
  det(p: Point): number {
    return (this.dy) * (p.x - this.p1.x) - (this.dx) * (p.y - this.p1.y)
  }

  onSegment(p: Point): boolean {
    return Math.min(this.p1.x, this.p2.x) <= p.x && p.x <= Math.max(this.p1.x, this.p2.x) 
      && Math.min(this.p1.y, this.p2.y) <= p.y && p.y <= Math.max(this.p1.y, this.p2.y) 
  }

  isIntersected(seg: Segment): boolean {
    const d1 = this.det(seg.p1)
    const d2 = this.det(seg.p2)
    const d3 = seg.det(this.p1)
    const d4 = seg.det(this.p2)

    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true
    } else if (d1 === 0 && this.onSegment(seg.p1) || d2 === 0 && this.onSegment(seg.p2)
    || d3 === 0 && seg.onSegment(this.p1) || d4 === 0 && seg.onSegment(this.p2)
    ) {
      return true
    }

    return false
  }

  _denominator(seg: Segment) {
    return this.dx * seg.dy - this.dy * seg.dx
  }
  
  /** line intersected point
   *  check on parallel before
   *  https://paulbourke.net/geometry/pointlineplane/
   * 
   * @param seg Segment
   * @returns ArrPoint
   */
  _lineIntersect (
    seg: Segment
  ): ArrPoint | false {
    const lineEquation = (u: number, seg: Segment): ArrPoint => {
      const px = seg.p1.x + u * seg.dx
      const py = seg.p1.y + u * seg.dy

      return [px, py]
    }
    const denominator = this._denominator(seg)
    const pu1 = (seg.dx * (this.p1.y - seg.p1.y) - seg.dy * (this.p1.x - seg.p1.x))
    // const pu2 = (this.dx * (this.p1.y - seg.p1.y) - this.dy * (this.p1.x - seg.p1.x))
    if (denominator === 0) {
      if (pu1 === 0) {
        // console.warn('collinear lines: return first point on segment')
        return this.onSegment(seg.p1) && seg.p1.arrPoint || this.onSegment(seg.p2) && seg.p2.arrPoint
      } else {
        // console.warn('parallel lines: segments not intersect')
        return false
      }
    }
    const u1 = pu1 / denominator
    // const u2 = pu2 / denominator

    return lineEquation(u1, this)
  }

  intersect(seg: Segment): Point | false {
    const result: false | ArrPoint = this.isIntersected(seg) && 
    this._lineIntersect(seg)
    return result && Point.from(result)
  }

  isCollinear(seg: Segment): boolean {
    if (!this.isParallel(seg)) 
      return false

    const d1 = this.det(seg.p1)

    if (d1 === 0) {
      return true
    }
    return false
  }

  intersectedSegment(seg: Segment): false | Point | Segment {
    if (this.isIntersected(seg)) {
      if (this.isCollinear(seg)) {
        const isP1 = this.onSegment(seg.p1)
        const isP2 = this.onSegment(seg.p2)
        const isP3 = seg.onSegment(this.p1)
        const isP4 = seg.onSegment(this.p2)
        const points = [isP1 && seg.p1, isP2 && seg.p2, isP3 && this.p1, isP4 && this.p2].filter(p => p)
        // todo: Sorted by it should be in right clockwise direction: from begin to end
        const sortedPoints = points.sort((pa, pb) => {
          if (pa.x === pb.x) {
            return pa.y - pb.y
          }
          return pa.x - pb.x
        })
        const clearedPoints = [sortedPoints[0], sortedPoints[sortedPoints.length - 1]]
        if (clearedPoints[0].x === clearedPoints[1].x && clearedPoints[0].y === clearedPoints[1].y) {
          return Point.from(clearedPoints[0])
        } else {
          return Segment.from(clearedPoints[0], clearedPoints[1])
        }
      } else {
        const point = this._lineIntersect(seg)
        return point && Point.from(point)
      }
    }
    return false
  }
}

export default Segment
