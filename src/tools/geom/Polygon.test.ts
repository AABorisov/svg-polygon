import { ArrPoint, TPoint } from '../point'
import Polygon from './Polygon'
import Segment from './Segment'


const arrPoints: ArrPoint[] = [[1, 1], [1, 3], [3, 3], [3, 1]]
const tPoints: TPoint[] = [{x: 1, y: 1}, {x: 1, y: 3}, {x: 3, y: 3}, {x: 3, y: 1}]
const segments: [ArrPoint, ArrPoint][] = [[[1, 1], [1, 3]], [[1, 3], [3, 3]], [[3, 3], [3, 1]], [[3, 1], [1, 1]]]
describe('Polygon', () => {
  it('from arrPoints', () => {
    expect(Polygon.from(arrPoints).arrPoints).toStrictEqual(arrPoints)
  })
  it('from tPoints', () => {
    expect(Polygon.from(tPoints).arrPoints).toStrictEqual(arrPoints)
  })

  it('segments', () => {
    expect(Polygon.from(arrPoints).segments).toStrictEqual(segments.map(Segment.fromSegment))
  })
})