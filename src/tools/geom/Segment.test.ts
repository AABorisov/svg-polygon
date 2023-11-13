import { ArrPoint, TPoint } from "../point"
import Segment from "./Segment"
import Point from "./Point"


type TArrPointSegment = [ArrPoint, ArrPoint]
const arrSegment: TArrPointSegment = [[1, 2], [1, 3]]
const tSegment: [TPoint, TPoint] = [{ x: 2, y: 3 }, { x: 2, y: 4 }]
describe('Segment test', () => {
  it('from arrPoints', () => {
    const segment = Segment.from(arrSegment[0], arrSegment[1])
    const p1 = Point.from(arrSegment[0])
    const p2 = Point.from(arrSegment[1])

    expect(segment.p1).toStrictEqual(p1)
    expect(segment.p2).toStrictEqual(p2)
    expect(segment.arrPoints).toStrictEqual(arrSegment)
  })

  it('from tPoints', () => {
    const segment = Segment.from(tSegment[0], tSegment[1])
    const p1 = Point.from(tSegment[0])
    const p2 = Point.from(tSegment[1])

    expect(segment.p1).toStrictEqual(p1)
    expect(segment.p2).toStrictEqual(p2)
    expect(segment.points).toStrictEqual(tSegment)
  })

  it('get seg', () => {
    const segment = Segment.from(arrSegment[0], arrSegment[1])
    const p1 = Point.from(arrSegment[0])
    const p2 = Point.from(arrSegment[1])

    expect(segment.seg).toStrictEqual([p1, p2])
  })

  it('distance', () => {
    const segment = Segment.from(tSegment[0], tSegment[1])

    expect(segment.distance).toBe(1)
  })

  it('dx dy', () => {
    const segment = Segment.from(tSegment[0], tSegment[1])

    expect(segment.dx).toBe(0)
    expect(segment.dy).toBe(1)
  })

  it('distanceToPoint', () => {
    const segment = Segment.fromSegment(arrSegment)
    const p1 = Point.from(tSegment[0])
    const p2 = Point.from(tSegment[1])

    expect(segment.distanceToPoint(p1)).toBe(1)
    expect(segment.distanceToPoint(p2)).toBe(Math.SQRT2)
  })

  it('distanceToPoint with isProjection', () => {
    const segment = Segment.fromSegment(arrSegment)
    const p1 = Point.from(tSegment[0])
    const p2 = Point.from(tSegment[1])

    expect(segment.distanceToPoint(p1, true)).toBe(1)
    expect(segment.distanceToPoint(p2, true)).toBe(1)
  })

  it('segment with one point', () => {
    const p: ArrPoint = [1, 2] 
    const segment = Segment.from(p, p)
    const p1 = Point.from(tSegment[0])
    const p2 = Point.from(tSegment[1])

    expect(segment.distance).toBe(0)
    expect(segment.distanceToPoint(p1)).toBe(Math.SQRT2)
    expect(segment.distanceToPoint(p2)).toBe(Math.sqrt(5))
    expect(segment.distanceToPoint(p1, true)).toBe(Math.SQRT2)
    expect(segment.distanceToPoint(p2, true)).toBe(Math.sqrt(5))
  })

  it('distanceToPoint with segment [(0, 0), (1, 1)] and point (0, 1)', () => {
    const arrSegment: [ArrPoint, ArrPoint] = [[0, 0], [1, 1]]
    const arrPoint: ArrPoint = [0, 1]
    const segment = Segment.fromSegment(arrSegment)
    const p1 = Point.from(arrPoint)
    const obviousSolution = p1.getDistance(Point.from([0.5, 0.5]))

    expect(segment.distanceToPoint(p1)).toBeCloseTo(obviousSolution, 10)
  })

  it('intersect [[0, 0], [1, 1]] and [[0, 1], [1, 0]] should be [0.5, 0.5]', () => {
    const arrSegment1: [ArrPoint, ArrPoint] = [[0, 0], [1, 1]]
    const arrSegment2: [ArrPoint, ArrPoint] = [[0, 1], [1, 0]]
    const segment1 = Segment.from(arrSegment1[0], arrSegment1[1])
    const segment2 = Segment.from(arrSegment2[0], arrSegment2[1])
    const expected = Point.from([0.5, 0.5])

    expect(segment1.intersect(segment2)).toStrictEqual(expected)
  })
  it('intersect false', () => {
    const arrSegment1: [ArrPoint, ArrPoint] = [[0, 0], [0, 1]]
    const arrSegment2: [ArrPoint, ArrPoint] = [[1, 0], [1, 1]]
    const segment1 = Segment.from(arrSegment1[0], arrSegment1[1])
    const segment2 = Segment.from(arrSegment2[0], arrSegment2[1])
    const expected = false

    expect(segment1.intersect(segment2)).toStrictEqual(expected)
  })
  it('isParallel', () => {
    const segment1 = Segment.fromSegment(arrSegment)
    const segment2 = Segment.fromSegment(tSegment)
    expect(segment1.isParallel(segment2)).toBeTruthy()
  })
  
  it('isCollinear', () => {
    const segment1 = Segment.fromSegment([[0, 0], [1, 1]])
    const segment2 = Segment.fromSegment([[1, 1], [2, 2]])
    const segment3 = Segment.fromSegment([[1, 0], [2, 1]])

    expect(segment1.isCollinear(segment2)).toBeTruthy()
    expect(segment1.isCollinear(segment3)).toBeFalsy()
  })

  it('intersectedSegment', () => {
    const segment1 = Segment.fromSegment([[0, 0], [2, 2]])
    const segment2 = Segment.fromSegment([[1, 1], [2, 2]])
    const expected = Segment.fromSegment([[1, 1], [2, 2]])

    expect(segment1.intersectedSegment(segment2)).toStrictEqual(expected)
  })

  it('intersect parallel', () => {
    const segment1 = Segment.fromSegment(arrSegment)
    const segment2 = Segment.fromSegment(tSegment)
    expect(segment1._lineIntersect(segment2)).toBeFalsy()
  })
})

describe('distance to point', () => {
  const arrSegment: TArrPointSegment = [[3, 1], [3, 3]]
  const segment = Segment.fromSegment(arrSegment)
  // first point: [2, 0]
  const layX: boolean[] = [false, true, false]
  const layY: boolean[] = [false, true, true, true, false]
  const result = (isLayX: boolean, isLayY: boolean) => {
    return isLayX && isLayY ? 0 : isLayX || isLayY ? 1 : Math.sqrt(2)
  }
  const table: [p: ArrPoint, expected: number][] = []
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 3; x++) {
      table.push([[x + 2, y], result(layX[x], layY[y])])
    }
  }
  it.each(table)('%j should be %i', (p, expected) => {
    const point = Point.from(p)
    expect(segment.distanceToPoint(point)).toBeCloseTo(expected)
  })
})

describe('Segments intersect perpendicular segments', () => {
  const arrSegment1: TArrPointSegment = [[3, 1], [3, 3]]
  // first arrSegment2: [[0, 0], [2, 0]]
  const intersectX: boolean[] = [false, true, true, true, false]
  const intersectedPoint: Array<false | ArrPoint> = [false, [3, 1], [3, 2], [3, 3], false]
  const table: [segment1: TArrPointSegment, segment2: TArrPointSegment, expected: false | ArrPoint][] = []
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      table.push([arrSegment1, [[x, y], [x + 2, y]], intersectX[x] && intersectedPoint[y]])
    }
  }
  it.each(table)('intersect segment %j and segment %j should be %j', (arrSegment1, arrSegment2, expected) => {
    const segment1 = Segment.fromSegment(arrSegment1)
    const segment2 = Segment.fromSegment(arrSegment2)
    const intersected = expected && Point.from(expected)

    expect(segment1.intersect(segment2)).toStrictEqual(intersected)
    expect(segment1.intersectedSegment(segment2)).toStrictEqual(intersected)
  })
})

describe('Segments intersect slope segments', () => {
  const arrSegment1: TArrPointSegment = [[1, 1], [3, 4]]
  // first arrSegment2: [[-1, 0], [2, 0]] [[-0.5, 0.5], [5.5, 2.5]]
  const intersectedPoint: Array<false | ArrPoint> = [
    false, 
    [1, 1], 
    [2, 2.5], 
    [3, 4], 
    false
  ]
  const table: [segment1: TArrPointSegment, segment2: TArrPointSegment, expected: false | ArrPoint][] = []
  for (let y = 0; y < 5; y++) {
      table.push([arrSegment1, [[-0.5 - 1 + y, -0.5 - 0.5 + y * 1.5], [5.5 - 1 + y, 1.5 - 0.5 + 1.5* y]], intersectedPoint[y]])
  }
  it.each(table)('intersect segment %j and segment %j should be %j', (arrSegment1, arrSegment2, expected) => {
    const segment1 = Segment.fromSegment(arrSegment1)
    const segment2 = Segment.fromSegment(arrSegment2)
    const intersected = expected && Point.from(expected)

    expect(segment1.intersect(segment2)).toStrictEqual(intersected)
    expect(segment1.intersectedSegment(segment2)).toStrictEqual(intersected)
  })
})

describe('Segments intersect parallel segments', () => {
  const arrSegment1: TArrPointSegment = [[1, 3], [1, 5]]
  // first arrSegment2: [[0, 0], [0, 2]]
  const intersectX: boolean[] = [false, true, false]
  const intersectedResult: Array<false | TPoint | [ArrPoint, ArrPoint]> = 
    [false, {x: 1, y: 3}, [[1, 3], [1, 4]], [[1, 3], [1, 5]], [[1, 4], [1, 5]], {x: 1, y: 5}, false]
  const intersectedPoint: Array<false | TPoint> = [
    false, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 5 }, false
  ]
  const table: [
    segment1: TArrPointSegment, 
    segment2: TArrPointSegment, 
    expected: false | TPoint | [ArrPoint, ArrPoint],
    expected2: false | TPoint
  ][] = []
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 3; x++) {
      table.push([arrSegment1, [[x, y], [x, y + 2]], intersectX[x] && intersectedResult[y], intersectX[x] && intersectedPoint[y]])
    }
  }
  it.each(table)('intersect segment %j and segment %j should be %j', (arrSegment1, arrSegment2, expected, expected2) => {
    const segment1 = Segment.fromSegment(arrSegment1)
    const segment2 = Segment.fromSegment(arrSegment2)
    const intersected = expected && (Array.isArray(expected) ? Segment.fromSegment(expected) : Point.from(expected))
    const intersected2 = expected2 && Point.from(expected2)

    expect(segment1.isParallel(segment2)).toBeTruthy()
    expect(segment1.intersect(segment2)).toStrictEqual(intersected2)
    expect(segment1.intersectedSegment(segment2)).toStrictEqual(intersected)
  })
})