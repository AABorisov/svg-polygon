import Polygon from "./geom/Polygon"
import { getNumber, parsePath, parsePoints } from "./parsePath"
import { ArrPoint } from "./point"


export type TDrawSvgProps = {
  src: string
}

export type TParseElementResult = {
  attributes: Record<string, string>
  tagName: string
  classList: any
  children: TParseElementResult[]
}

export type TSurface = ArrPoint[]

/** Start parsing function */

export const parseSvg = (sourceElement: Element) => {
  const parsedElement = parseElement(sourceElement)
  const parsedDots = parseDots(parsedElement)
  // console.log(parsedDots)
  // return parsedDots.children.map(c => c.polygon).filter(c => c).map(p => p.arrPoints)
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
      // surfaces.push(...parsedDots.dots as never as ArrPoint[][])
      // break
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

export type TParseDots = {
  edge?: [ArrPoint, ArrPoint, ArrPoint, ArrPoint]
  dots: ArrPoint[]
  polygon: Polygon
  tagName: string
  children: TParseDots[]
}
const parseDots = (source: TParseElementResult): TParseDots => {
  let dots = [];
  let polygon: Polygon = null
  let children = source.children.map(parseDots)
  switch (source.tagName) {
    case "svg": {
      const childrenPolygons = children.map(c => c.polygon).filter(c => c)
      console.log('svg', childrenPolygons)
      polygon = childrenPolygons.reduce((acc: Polygon | null, pol) => {
        if (acc === null) {
          acc = pol
        } else {
          acc.union(pol)
        }

        return acc
      }, null)

      dots = polygon.arrPoints
    }
      break
    case "defs":
    case "style":
    case "clipPath":
      children = []
      break
    case "g":
      const childrenPolygons = children.map(c => c.polygon)
      polygon = childrenPolygons.reduce((acc: Polygon | null, pol) => {
        if (acc === null) {
          acc = pol
        } else {
          acc.union(pol)
        }

        return acc
      }, null)

      dots = polygon.arrPoints

      // children = []
      
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

      polygon = Polygon.from(dots)
      dots = polygon.arrPoints

      break
    case "path":
      const d = source.attributes['d']
      if (!d) break
      const parsed = parsePath(d);
      dots = parsed

      polygon = parsed.reduce((acc: Polygon, subpath) => {
        if (acc === null) {
          acc = Polygon.from(subpath)
        } else {
          acc.union(Polygon.from(subpath))
        }
        return acc
      }, null)

      dots = polygon.arrPoints

      break
    case "line":
      const { x1, y1, x2, y2 } = source.attributes
      dots = [
        [getNumber(x1), getNumber(y1)],
        [getNumber(x2), getNumber(y2)]
      ]

      polygon = Polygon.from(dots)
      dots = polygon.arrPoints
      break
    case "polyline":
    case "polygon":
      const points = source.attributes['points']
      if (!points) break
      dots = parsePoints(points)

      polygon = Polygon.from(dots)
      dots = polygon.arrPoints
      
      break
    default:
      console.log('new tag', source.tagName)
    //
  }
  return {
    tagName: source.tagName,
    dots,
    children,
    polygon
  }
}

const union = (tree: TParseDots): any => {
  // const result = tree.children.reduce()
}
