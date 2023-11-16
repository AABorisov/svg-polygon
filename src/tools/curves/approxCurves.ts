import type { CoordinatePair, TCmdData, TCurvesCmdTypes, TSubpathGen } from "../grammars/svgpath.types";
import type { CenterParamObject, SvgArcToCenterParams } from "./svgArcToCenter";

import { CmdType } from "../grammars/svgpath.types";
import { getDistance } from "../geom/geom";
import { bezierCubicCurve, bezierQuadCurve, calcCurvePoint, calcEllipsePoint } from "./curveFunc";
import { svgArcToCenterParam } from "./svgArcToCenter";

const ellipseArcCurve = (params: SvgArcToCenterParams, countPoints: number): CoordinatePair[] => {
  const [_x1, _y1, _rx, _ry, _degree, _fA, _fS, x2, y2] = params
  const endPoint: CoordinatePair = [x2, y2]
  const result: CoordinatePair[] = []
  const angles: number[] = []
  let centerObject: CenterParamObject

  try {
    centerObject = svgArcToCenterParam(params)
  } catch (e) {
    console.warn(e)
    result.push(endPoint)
    return result
  }
  const { startAngle, deltaAngle } = centerObject;
  const pointsCount = countPoints * 5
  for (let i = 1; i < pointsCount; i++) {
    angles.push(startAngle + i * deltaAngle / pointsCount)
  }
  if (!angles.length) {
    result.push(endPoint)
    return result
  }

  const points = angles.map((angle) => calcEllipsePoint(centerObject, angle))
  result.push(...points)
  result.push(endPoint)

  return result
}


// https://javascript.info/bezier-curve
const getCurveCoords = (
  type: TCurvesCmdTypes,
  startPoint: CoordinatePair,
  endPoint: CoordinatePair,
  data: TCmdData<TCurvesCmdTypes>,
  previousReflectedControl?: CoordinatePair
): CoordinatePair[] => {
  const LENGTH_BETWEEN_POINTS = 5
  const distance = getDistance(startPoint, endPoint)
  const countPoints = Math.floor(distance / LENGTH_BETWEEN_POINTS)
  const result: CoordinatePair[] = []

  const times = []

  for (let i = 1; i <= countPoints; i++) {
    times.push(i * 1 / countPoints)
  }

  if (!times.length) {
    result.push(endPoint)
  }

  switch (type) {
    case CmdType.C: {
      type TType = typeof type
      const points = [startPoint, ...(data as TCmdData<TType>)]
      const curveFunc = calcCurvePoint(points, bezierCubicCurve)
      const curvePoints = times.map(curveFunc)
      result.push(...curvePoints)
      break
    }
    case CmdType.S: {
      type TType = typeof type
      const points = [startPoint, previousReflectedControl || startPoint, ...(data as TCmdData<TType>)]
      const curveFunc = calcCurvePoint(points, bezierCubicCurve)
      const curvePoints = times.map(curveFunc)
      result.push(...curvePoints)
      break
    }
    case CmdType.Q: {
      type TType = typeof type
      const points = [startPoint, ...(data as TCmdData<TType>)]
      const curveFunc = calcCurvePoint(points, bezierQuadCurve)
      const curvePoints = times.map(curveFunc)
      result.push(...curvePoints)
      break
    }
    case CmdType.T: {
      type TType = typeof type
      const points = [startPoint, previousReflectedControl || startPoint, (data as TCmdData<TType>)]
      const curveFunc = calcCurvePoint(points, bezierQuadCurve)
      const curvePoints = times.map(curveFunc)
      result.push(...curvePoints)
      break
    }
    case CmdType.A: {
      type TType = typeof type
      const [rx, ry, degree, fA, fS, [x2, y2]] = (data as TCmdData<TType>)
      const params: SvgArcToCenterParams = [startPoint[0], startPoint[1],
        rx, ry, degree, fA, fS, x2, y2]
      const curvePoints = ellipseArcCurve(params, countPoints)
      result.push(...curvePoints)
      break
    }
    default:
      result.push(endPoint)
  }

  return result
}

export const clearSurfaces = (subpaths: TSubpathGen[]): CoordinatePair[][] => {
  return subpaths.map(subpath => {
    // https://svgwg.org/svg2-draft/paths.html#PathDataCubicBezierCommands -- Bézier curve commands
    let previousReflectedControlC: CoordinatePair | null = null
    let previousReflectedControlQ: CoordinatePair | null = null

    return subpath.reduce((acc, cmd) => {
      const startPoint = acc[acc.length - 1]
      switch (cmd.type) {
        case CmdType.C || CmdType.S: {
          type TType = typeof cmd.type
          const data = cmd.data as TCmdData<TType>
          const points = getCurveCoords(cmd.type, startPoint, cmd.coord, data, previousReflectedControlC)
          acc.push(...points)

          previousReflectedControlC = [
            2 * cmd.coord[0] - data[data.length - 2][0],
            2 * cmd.coord[1] - data[data.length - 2][1]
          ]
          previousReflectedControlQ = null
          break
        }
        case CmdType.Q || CmdType.T: {
          type TType = typeof cmd.type
          const data = cmd.data as TCmdData<TType>
          acc.push(...getCurveCoords(cmd.type, startPoint, cmd.coord, data, previousReflectedControlQ))

          const prevControlQ = cmd.type === CmdType.Q ? data[data.length - 2] : previousReflectedControlQ
          previousReflectedControlQ = [
            2 * cmd.coord[0] - prevControlQ[0],
            2 * cmd.coord[1] - prevControlQ[1]
          ]
          previousReflectedControlC = null
          break
        }
        case CmdType.A: {
          type TType = typeof cmd.type
          const data = cmd.data as TCmdData<TType>
          acc.push(...getCurveCoords(cmd.type, startPoint, cmd.coord, data))

          previousReflectedControlC = null
          previousReflectedControlQ = null
          break
        }
        default:
          acc.push(cmd.coord)
          previousReflectedControlC = null
          previousReflectedControlQ = null
      }
      return acc
    }, [])
  })
}
