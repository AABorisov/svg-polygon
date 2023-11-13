import { clearSurfaces } from "./curves/approxCurves"
import { ArrPoint } from "./point"
import { parseSvgPath, convertToAbsoluteSubpaths, closeSurfaces } from "./svgPathTransformer"


type TPathCommand = {
  type: 'm' | 'l'
  coords: 'abs' | 'rel'
}
type TPath = {
  closed: boolean
}

export const parsePath = (source: string): ArrPoint[][] => {
  const relativeSubPaths = parseSvgPath(source);
  const absSubPaths = convertToAbsoluteSubpaths(relativeSubPaths);
  const closedSubpaths = closeSurfaces(absSubPaths)
  const clearedSurfaces = clearSurfaces(closedSubpaths)
  // const surface:ArrPoint[] = intersectSurfaces(cleared)

  return clearedSurfaces
}

export const parsePoints = (source: string): ArrPoint[] => {
  type TReduceResult = {
    points: ArrPoint[],
    error: boolean
  }
  const result = source.split(/[, ]/).map(Number).reduce((acc, n): TReduceResult => {
    if (acc.error) return acc
    if (Number.isNaN(n)) {
      acc.error = true
    } else {
      if (acc.points.length === 0 || acc.points[acc.points.length - 1].length == 2) {
        acc.points.push([n])
      } else {
        acc.points[acc.points.length - 1].push(n)
      }
    }
    return acc
  }, {
    points: [],
    error: false
  })
  if (result.points[result.points.length - 1].length !== 2) {
    result.error = true
  }

  if (result.error) {
    console.error("Point parse error. See: https://svgwg.org/svg2-draft/shapes.html#DataTypePoints")
  }

  return result.points;
}

export const getNumber = (val: string, defaultVal: number = 0) => {
  return Number(val) || defaultVal
}