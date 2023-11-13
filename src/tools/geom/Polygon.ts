import { ArrPoint, TPoint } from "../point"
import Segment from "./Segment"
import Point from "./Point"

/**
 * Polygon: 
 * Points: Point[] ([p0, p1, p2]), where lines between every point end closes with p0: p0---p1----p2---p0
 * Lines: Point[][2] ([[p0, p1], [p1, p2], [p2, p0]]), Lines.length === Points.length
 * 
 * always clockwise
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
  _edge: [minX: number, minY: number, maxX: number, maxY: number] = null
  _segments: Segment[] = null
  _edgeSegments: Segment[] = null

  constructor(points: Point[]) {
    if (Polygon.isClockwise(points)) {
      this._points = points
    } else {
      this._points = points.reverse()
    }
  }

  static from(points: ArrPoint[] | TPoint[]) {
    return new Polygon(points.map(Point.from))
  }

  // https://paulbourke.net/geometry/polygonmesh/#clockwise
  static isClockwise(points: Point[]) {
    const sum = points.reduce((acc, p, index, points)=> {
      const [p0, p1, p2] = [
        p, // i - 1
        points[(index + 1) % points.length], // i
        points[(index + 2) % points.length] // i + 1
      ]
      const cross = (p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x)
      return acc + cross
    }, 0)

    return sum >= 0
  }

  get points() {
    return this._points
  }

  _getSegments() {
    const points = this._points
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

  get segments() {
    if (this._segments === null) {
      this._getSegments()
    }
    return this._segments
  }

  _getEdge() {
    const points = this.points
    let minX: number, minY: number, maxX: number, maxY: number
    minX = minY = Infinity
    maxX = maxY = -Infinity

    for (let i = 0, len = points.length; i < len; i++) {
      const point = points[i];
      if (point.x < minX) {
        minX = point.x
      }
      if (point.x > maxX) {
        maxX = point.x
      }
      if (point.y < minY) {
        minY = point.y
      }
      if (point.y > maxY) {
        maxY = point.y
      }
    }
    this._edge = [minX, minY, maxX, maxY]
  }

  get edge() {
    if (this._edge === null) {
      this._getEdge()
    }
    return this._edge
  }

  _getEdgeSegments() {
    const [minX, minY, maxX, maxY] = this.edge
    const edgePoints: [ArrPoint, ArrPoint, ArrPoint, ArrPoint] = [[minX, maxY], [maxX, maxY], [maxX, minY], [minX, minY]]
    const edgeSegments = edgePoints.reduce((acc: Segment[], p1, index) => {
      const p2 = edgePoints[(index + 1) % edgePoints.length]
      acc.push(Segment.from(p1, p2))
      return acc
    }, [])
    this._edgeSegments = edgeSegments
  }

  get edgeSegments() {
    if (this._edgeSegments === null) {
      this._getEdgeSegments()
    }
    return this._edgeSegments
    
  }

  get arrPoints() {
    return this.points.map((p) => p.arrPoint)
  }

  // false if not, -1 if pol > this other 1
  _checkOver(pol: Polygon): false | -1 | 1 {
    const [minX, minY, maxX, maxY] = this.edge
    const [minX2, minY2, maxX2, maxY2] = pol.edge
    if (minX >= minX2 && minY >= minY2 && maxX <= maxX2 && maxY <= maxY2) {
      return -1
    } else if (minX <= minX2 && minY <= minY2 && maxX >= maxX2 && maxY >= maxY2) {
        return 1
    }
    return false
  }

  _checkIntersectSegments(segments: Segment[], otherSegments: Segment[]): false | [number, number] {
    for (let i = 0, len = segments.length; i < len; i++) {
      for (let j = 0, len2 = otherSegments.length; j < len2; j++) {
        if (segments[i].isIntersected(otherSegments[j])) return [i, j]
      }
    }
    return false
  }

  _checkIntersectEdges(pol: Polygon): boolean {
    const edgeSegments = this.edgeSegments
    const edgeSegments2 = pol.edgeSegments
    console.log('_checkIntersectEdges', Boolean(this._checkIntersectSegments(edgeSegments, edgeSegments2)), this.edge, pol.points)
    return Boolean(this._checkIntersectSegments(edgeSegments, edgeSegments2))
  }

  _isIntersect(pol: Polygon): boolean {
    // if exist one intersect segment or over
    // check pol over
    if (this._checkOver(pol)) return true
    // check edge intersected then all segments intersected
    return this._checkIntersectEdges(pol) && Boolean(this._checkIntersectSegments(this.segments, pol.segments))
  }

  __union(ps1: Point[], ps2: Point[], start1: number = 0, start2: number = 0): Point[] {
    const points = []
    const addPoint = (point: Point): boolean => {
      const prevPoint = points[points.length - 1]
      if (prevPoint && prevPoint.x === point.x && prevPoint.y === point.y) return false
      points.push(point)
      return true
    }
    let isSecond = false
    let startJ = start2
    let first2: number = null
    for (let i = start1, len = ps1.length; i < len; i++) {
      addPoint(ps1[i])
      for (let j = startJ, len2 = ps2.length + Number(first2); j < len2; j++) {
        if (!isSecond) {
          const seg1 = Segment.from(ps1[i % ps1.length], ps1[(i + 1) % ps1.length])
          const seg2 = Segment.from(ps2[j % ps2.length], ps2[(j + 1) % ps2.length])
          const intersectedSegment = seg1.intersectedSegment(seg2);

          if (intersectedSegment) {
            if (first2 === null) {
              first2 = j + 1
            }
            if (intersectedSegment instanceof Segment) {
              console.log(intersectedSegment)
              // any case, get nearest point
              intersectedSegment
            } else {
              const prevPoint = points[points.length - 1]
              // if (prevPoint.x === intersectedSegment.x && prevPoint.y === intersectedSegment.y) break
              addPoint(intersectedSegment)
              isSecond = true
            }
          }
        } else {
          addPoint(ps2[j % ps2.length])
          for (let k = i; k < len; k++) {
            console.log('__union k start', i, j, k, isSecond)
            const seg1 = Segment.from(ps2[j % ps2.length], ps2[(j + 1) % ps2.length])
            const seg2 = Segment.from(ps1[k % ps1.length], ps1[(k + 1) % ps1.length])
            const intersectedSegment = seg1.intersectedSegment(seg2)

            if (intersectedSegment) {
              if (intersectedSegment instanceof Segment) {
                // any case, get nearest point
                intersectedSegment
              } else {
                const prevPoint = points[points.length - 1]
                // if (prevPoint.x === intersectedSegment.x && prevPoint.y === intersectedSegment.y) break
                // add this point to collect
                addPoint(intersectedSegment)
                isSecond = false
                i = k
                startJ = j
                break
              }
            }
          }
        }
      }
    }


    return points
  }

  _union(segs1: Segment[], segs2: Segment[], startI: number, startJ: number): Point[] {
    // checked intersections before
    const points = segs1.reduce((acc, seg, index) => {
      acc.push(seg.p1)
      const intersected = this._checkIntersectSegments([seg], segs2)
      if (intersected) {
        const [_i, j] = intersected

        const intersectedSegment = seg.intersectedSegment(segs2[j])
        if (intersectedSegment) {
          if (intersectedSegment instanceof Segment) {

            acc.push()
          }
        }
      }
      return acc
    }, [])

    return points
  }

  union(pol: Polygon): Polygon {
    // case not intesect polygon: we can add one neares point or projection to second polygon to intersect in one point
    // or return two polygons
    console.log('union check is intersect')
    if (!this._isIntersect(pol)) return this
    console.log('union check has intersected')


    // case over
    const over = this._checkOver(pol)
    if (over) {
      console.log(' over', this, pol)
      return (over === 1) ? this : pol
    }
    
    this._points = this.__union(this.points, pol.points, 0, 0)

    return this
  }
}

export default Polygon