import { ArrPoint, TPoint } from '../point'
import Polygon from './Polygon'
import Segment from './Segment'


const arrPoints: ArrPoint[] = [[1, 1], [1, 3], [3, 3], [3, 1]]
const tPoints: TPoint[] = [{x: 1, y: 1}, {x: 1, y: 3}, {x: 3, y: 3}, {x: 3, y: 1}]
const segments: [ArrPoint, ArrPoint][] = [[[3, 1], [3, 3]], [[3, 3], [1, 3]], [[1, 3], [1, 1]], [[1, 1], [3, 1]]]
describe('Polygon', () => {
  it('from arrPoints', () => {
    expect(Polygon.from(arrPoints).arrPoints).toStrictEqual(arrPoints.slice().reverse())
  })
  it('from tPoints', () => {
    expect(Polygon.from(tPoints).arrPoints).toStrictEqual(arrPoints.slice().reverse())
  })

  it('segments', () => {
    expect(Polygon.from(arrPoints).segments).toStrictEqual(segments.map(Segment.fromSegment))
  })

  it('check clockwise', () => {
    const pol = Polygon.from(arrPoints)
    const polArrPoints = pol.arrPoints
    expect(polArrPoints).toStrictEqual(arrPoints.slice().reverse()) // changed
    expect(Polygon.from(polArrPoints).arrPoints).toStrictEqual(arrPoints.slice().reverse()) // not changed
  })
})

describe('Polygon union', () => {
  it('same polygons', () => {
    const pol1 = Polygon.from(arrPoints)
    const pol2 = Polygon.from(tPoints)
    expect(pol1.union(pol2).arrPoints).toStrictEqual(arrPoints.slice().reverse())
  })
  it('different polygons', () => {
    const pol1 = Polygon.from(arrPoints)
    const pol2 = Polygon.from([[10, 10], [11, 11], [10, 11]])
    expect(pol1.union(pol2).arrPoints).toStrictEqual(arrPoints.slice().reverse())
  })
  it('two rectangle', () => {
    const pol1 = Polygon.from(arrPoints)
    const pol2 = Polygon.from(arrPoints.map((p): ArrPoint => p.map(v => v + 1) as ArrPoint))
    const u = pol1.union(pol2).arrPoints
    // expect(pol1.union(pol2).arrPoints).toBe
  })
  it('two rectangle2', () => {
    const pol1 = Polygon.from([[50, 250], [650, 250], [650, 450], [50, 450]])
    const pol2 = Polygon.from([[250, 50], [450, 50], [450, 650], [250, 650]])
    const expected = [
      [50, 250], [450, 250],
      [450, 650], [250, 650],
      [250, 250], [650, 250],
      [650, 450], [250, 450],
      [250, 50], [450, 50],
      [450, 450], [50, 450]
    ]
    expect(pol1.union(pol2).arrPoints).toStrictEqual(expected)
  })
})