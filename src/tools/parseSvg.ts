import { clearSurfaces } from "./curves/approxCurves"
import { ArrPoint } from "./point"
import { closeSurfaces, convertToAbsoluteSubpaths, parseSvgPath } from "./svgPathTransformer"


export type TDrawSvgProps = {
  src: string
}

export type TParseElementResult = {
  attributes: Record<string, string>
  tagName: string
  classList: any
  children: TParseElementResult[]
}
export type TParseDots = {
  edge?: [ArrPoint, ArrPoint, ArrPoint, ArrPoint],
  dots: ArrPoint[],
  tagName: string
  children: TParseDots[]
}

export type TSurface = ArrPoint[]

/** Start parsing function */

export const parseSvg = (sourceElement: Element) => {
  const parsedElement = parseElement(sourceElement)
  const parsedDots = parseDots(parsedElement)
  const surfaces = convertDotsToSurfaces(parsedDots)
  const result = clearFromEmpty(surfaces)
  const unionResult = union(parsedDots)

  return result
}

export const clearFromEmpty = (surfaces: ArrPoint[][]): ArrPoint[][] =>{
  return surfaces.filter((surface) => surface.length)
}

const convertDotsToSurfaces = (parsedDots: TParseDots): ArrPoint[][] => {
  const surfaces: ArrPoint[][] = []
  const childSurfaces: ArrPoint[][] = parsedDots.children.reduce((acc: ArrPoint[][], child) => {
    acc.push(...convertDotsToSurfaces(child))
    return acc
  }, [])
  switch (parsedDots.tagName) {
    case 'path':
      surfaces.push(...parsedDots.dots as never as ArrPoint[][])
      break
    default:
      if (parseDots.length)
        surfaces.push(parsedDots.dots)
  }
  surfaces.push(...childSurfaces)

  return surfaces
}


const tags = {}


const parseElement = (source: Element): TParseElementResult => {
  try {
    tags[source.tagName] = (tags[source.tagName] || 0) + 1
    return {
      attributes: Array.from(source.attributes).reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {}),
      classList: Array.from(source.classList),
      tagName: source.tagName,
      children: Array.from(source.children).map(parseElement)
    }
  } catch {
    console.log('Error during parsing', source.tagName)
  }
}

type TPathCommand = {
  type: 'm' | 'l'
  coords: 'abs' | 'rel'
}
type TPath = {
  closed: boolean
}

const parsePath = (source: string): ArrPoint[][] => {
  const relativeSubPaths = parseSvgPath(source);
  const absSubPaths = convertToAbsoluteSubpaths(relativeSubPaths);
  const closedSubpaths = closeSurfaces(absSubPaths)
  const clearedSurfaces = clearSurfaces(closedSubpaths)
  // const surface:ArrPoint[] = intersectSurfaces(cleared)

  return clearedSurfaces
}
const parsePoints = (source: string): ArrPoint[] => {
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

const getNumber = (val: string, defaultVal: number = 0) => {
  return Number(val) || defaultVal
}

const parseDots = (source: TParseElementResult): TParseDots => {
  let dots = [];
  switch (source.tagName) {
    case "svg":
      break
    case "defs":
    case "style":
    case "clipPath":
      source.children = []
      break
    case "g":
      break
    case "rect":
      const { x: xStr, y: yStr, width: widthStr, height: heightStr } = source.attributes
      const [x, y, width, height] = [xStr, yStr, widthStr, heightStr].map(getNumber)
      if (!width || !height) break

      dots = [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height]
      ]
      break
    case "path":
      const d = source.attributes['d']
      if (!d) break
      const parsed = parsePath(d);
      dots = parsed
      break
    case "line":
      const { x1, y1, x2, y2 } = source.attributes
      dots = [
        [getNumber(x1), getNumber(y1)],
        [getNumber(x2), getNumber(y2)]
      ]
      break
    case "polyline":
    case "polygon":
      const points = source.attributes['points']
      if (!points) break
      dots = parsePoints(points)
      break
    default:
    //
  }
  return {
    tagName: source.tagName,
    dots,
    children: source.children.map(parseDots)
  }
}

const union = (tree: TParseDots): any => {
  // const result = tree.children.reduce()
}
