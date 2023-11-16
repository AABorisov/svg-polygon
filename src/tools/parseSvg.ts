// import Polygon from "./geom/Polygon"
import { getNumber, parsePath, parsePoints } from "./parsePath"
import { ArrPoint } from "./point"
const greinerHormann = require('greiner-hormann');
const PolyBool = require('polybooljs');


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
    default:
      if (parseDots.length)
        surfaces.push(...parsedDots.dots)
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

const unionChildrenDots = (childrenDots: ArrPoint[][][], tagName: string): ArrPoint[][] => {
  const dots = childrenDots.reduce((acc, dots) => {
    acc.push(...dots)
    return acc
  }, [])
  console.log(tagName, dots)
  return unionParsed(dots)
}

const unionParsed = (parsed: ArrPoint[] | ArrPoint[][]): ArrPoint[][] => {
  if (parsed && parsed[0] && typeof parsed[0][0] === 'number') {
    return [parsed as ArrPoint[]]
  }
  const dots = (parsed as ArrPoint[][]).reduce(unionDots, null)

  return dots
}
const unionDots = (regions: ArrPoint[][], dots: ArrPoint[], index: number): ArrPoint[][] => {
  if (index === 0) {
    return [dots]
  }
  const result = runUnion(dots, regions)
  return result 
}

const runUnion = (left: ArrPoint[], right: ArrPoint[][]): ArrPoint[][] => {
  const union = PolyBool.union({
    regions: [left]
  }, {
    regions: right
  })
  return union.regions as ArrPoint[][]
}

export type TParseDots = {
  edge?: [ArrPoint, ArrPoint, ArrPoint, ArrPoint]
  dots: ArrPoint[][]
  tagName: string
  children: TParseDots[]
}
const parseDots = (source: TParseElementResult): TParseDots => {
  let dots: ArrPoint[][] = [];
  let children = source.children.map(parseDots)
  switch (source.tagName) {
    case "svg": {
      const childrenPolygons = children.map(c => c.dots).filter(dots => dots.length)
      console.log('svg', childrenPolygons.length, children.map(c => c.dots).length)
      dots = unionChildrenDots(childrenPolygons, source.tagName)
      children = []
      break
    }
    case "defs":
    case "style":
    case "clipPath":
      children = []
      break
    case "g": {
      const childrenPolygons = children.map(c => c.dots)
      dots = unionChildrenDots(childrenPolygons, source.tagName)

      children = []
      
      break
    }
    case "rect": {
      const { x: xStr, y: yStr, width: widthStr, height: heightStr } = source.attributes
      const [x, y, width, height] = [xStr, yStr, widthStr, heightStr].map(getNumber)
      if (!width || !height) break

      const parsed: ArrPoint[] = [
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height]
      ]

      dots = unionParsed(parsed)
      break
    }
    case "path": {
      const d = source.attributes['d']
      if (!d) break
      const parsed = parsePath(d);
      dots = unionParsed(parsed)
      break
    }
    case "line": {
      const { x1, y1, x2, y2 } = source.attributes
      const parsed: ArrPoint[] = [
        [getNumber(x1), getNumber(y1)],
        [getNumber(x2), getNumber(y2)]
      ]
      dots = unionParsed(parsed)
      break
    }
    case "polyline":
    case "polygon": {
      const points = source.attributes['points']
      if (!points) break
      const parsed: ArrPoint[] = parsePoints(points)
      dots = unionParsed(parsed)
      break
    }
    default:
      console.log('new tag', source.tagName)
  }
  return {
    tagName: source.tagName,
    dots,
    children
  }
}

const union = (tree: TParseDots): any => {
  // const result = tree.children.reduce()
}
