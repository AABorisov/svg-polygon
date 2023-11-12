import { parse } from "./grammars/svgpath.grammar"
import { CmdType, Command, CoordinatePair, TCmdData, TCurvesCmdTypes, TSubpath, TSubpathGen, TSvgPath } from "./grammars/svgpath.types"

export const parseSvgPath = (svgPath: string): TSvgPath => {
  try {
    return parse(svgPath)
  } catch (error){
    console.log(error)
    return []
  }
}

export const convertToAbsoluteSubpaths = (subpaths: TSubpath[]) => {
  let firstCoordOfSubpath: CoordinatePair = [0, 0]
  // previous coordinate uses for relative coordinates
  let previousCoord: CoordinatePair = [0, 0]

  return subpaths.map((subpath, index) => {
    return subpath.map((cmd: Command<CmdType>) => {
      const isRel = !cmd.isAbs
      const pairIndexes: number[] = []
      const newCmd: Command<CmdType> = {
        ...cmd,
        coord: [...cmd.coord],
        isAbs: true
      }
      if (isRel) {
        newCmd.coord = [
          previousCoord[0] + cmd.coord[0],
          previousCoord[1] + cmd.coord[1],
        ]
      }
      switch (cmd.type) {
        case CmdType.M:
          // if it's first subpath, it is always absolute
          if (!index) {
            newCmd.coord = [...cmd.coord]
          }
          // Every subpath start from M coordinates
          firstCoordOfSubpath = [...newCmd.coord]
        case CmdType.L:
        case CmdType.T:
          newCmd.data = [...newCmd.coord]
          break
        case CmdType.Z:
          // Use first coordinates to close subpath
          newCmd.coord = [...firstCoordOfSubpath]
          break
        case CmdType.H:
          // y-coordinate is always previous y-coordinate
          newCmd.coord[1] = previousCoord[1]
          if (isRel) newCmd.data = previousCoord[0] + (cmd.data as TCmdData<CmdType.H>)
          break
        case CmdType.V:
          // x-coordinate is always previous x-coordinate
          newCmd.coord[0] = previousCoord[0]
          if (isRel) newCmd.data = previousCoord[1] + (cmd.data as TCmdData<CmdType.H>)
          break
        case CmdType.C:
        case CmdType.S:
        case CmdType.Q:
        case CmdType.A:
          type TCurvesTypes = typeof cmd.type;
          newCmd.data = (newCmd.data as TCmdData<TCurvesTypes>).map((item: number | CoordinatePair) => {
            if (Array.isArray(item)) {
              if (isRel) {
                return [previousCoord[0] + item[0], previousCoord[1] + item[1]]
              }
              return [...item]
            }
            return item
          }) as TCmdData<TCurvesTypes>
          break
      }

      previousCoord = [...newCmd.coord]

      return newCmd
    }) as TSubpath
  })
}

export const closeSurfaces = (subpaths: TSubpath[]) => {
  return subpaths.map(subpath => {
    let firstCoordOfSubpath: CoordinatePair = [...subpath[0].coord]
    let lastCmd = subpath[subpath.length - 1]
    if (lastCmd.type === "Z") {
      lastCmd = {
        ...lastCmd,
        type: CmdType[CmdType.L],
        data: [...lastCmd.coord]
      } as Command<CmdType.L>
    } else {
      subpath.push({
        type: CmdType[CmdType.L],
        data: [...firstCoordOfSubpath],
        coord: [...firstCoordOfSubpath],
        isAbs: true
      })
    }

    return subpath
  })
}
