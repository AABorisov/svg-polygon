import { ArrPoint, TPoint } from "../point"
import Segment from "./Segment"
import Point from "./Point"

/**
 * Polygon: 
 * Points: Point[] ([p0, p1, p2]), where lines between every point end closes with p0: p0---p1----p2---p0
 * Lines: Point[][2] ([[p0, p1], [p1, p2], [p2, p0]]), Lines.length === Points.length
 * 
 * If polygon2 touches polygon1, so exists one or more points in polygon2, which lies on lines of polygon1
 *   checkTouches (pointP2, linesP1) {
 *     
 *   }
 * If polygon2 intersect polygon1, so exists two or more lines who
 * 
 */
class Polygon {
  _points: Point[]
  _segments: Segment[]

  constructor(points: Point[]) {
    this._points = points
    this._segments = points.reduce((acc, p1, index) => {
      let p2: Point
      if (index !== points.length - 1) {
        p2 = points[index + 1]
      } else {
        p2 = points[0]
      }
      acc.push(new Segment(p1, p2))
      return acc
    }, [])
  }

  static from(points: ArrPoint[] | TPoint[]) {
    return new Polygon(points.map(Point.from))
  }

  get points() {
    return this._points
  }

  get segments() {
    return this._segments
  }

  get arrPoints() {
    return this.points.map((p) => p.arrPoint)
  }

  union(pol: Polygon) {
    
  }
}

export default Polygon