/**
 * Coverage class
 * 
 * 
 * 
 */

import Polygon from "./Polygon";
import Segment from "./Segment";
const PolyBool = require('polybooljs');

class Coverage {
  _polygon: Polygon = null
  
  constructor() {
  }

  get polygon() {
    return this._polygon
  }

  _getMinMax(min: number, max: number, polMin: number, polMax: number): [min: number, max: number] {
    let mi: number, ma: number

    if (polMax < min) {
      // left
      mi = polMax
      ma = min
    } else if (polMax <= max) {
      // polMax between min max
      ma = polMax
      if (polMin < min) {
        mi = min
      } else {
        // between
        mi = polMin
      }
    } else {
      // polMax > max
      // right
      if (polMin < min) {
        mi = min
        ma = max
      } else if (polMin <= max) {
        mi = polMin
        ma = max
      } else {
        // polMin > max
        // full right
        mi = max
        ma = polMin
      }
    }

    return [mi, ma]
  }

  _getMaxMin(min: number, max: number, polMin: number, polMax: number): [min: number, max: number] {
    return [Math.min(min, polMin), Math.max(max, polMax)]
  }

  _getShortestRectangle(pol: Polygon) {

    // Check nearest distance between edges
    // [minX, minY, maxX, maxY]
    const [thisMinX, thisMinY, thisMaxX, thisMaxY] = this.polygon.edge
    const [polMinX, polMinY, polMaxX, polMaxY] = pol.edge
    
    const [tl, tr, br, bl] = this.polygon.edgePoints
    const [ptl, ptr, pbr, pbl] = pol.edgePoints

    // let t: Segment, r: Segment, b: Segment, l: Segment
    const [l, r] = this._getMinMax(thisMinX, thisMaxX, polMinX, polMaxX)
    const [t, b] = this._getMinMax(thisMinY, thisMaxY, polMinY, polMaxY)

    const [minX, maxX] = this._getMaxMin(thisMinX, thisMaxX, polMinX, polMaxX)
    const [minY, maxY] = this._getMaxMin(thisMinY, thisMaxY, polMinY, polMaxY)

    
  }

  union(pol: Polygon) {
    if (this._polygon === null) {
      this._polygon = pol
      return
    }

    if (this.polygon.isIntersect(pol)) {
      // we should handle case of line
      const left = { regions: this.polygon.arrPoints }
      const right = { regions: pol.arrPoints }
      const union = PolyBool.union(left, right)

      if (union.regions.length > 1) {
        console.warn('Coverage.union: Strange behavior of PolyBool', union.regions)
      }

      this._polygon = Polygon.from(union.regions[0])
      return
    }

    // find shortest rectangle to join both region




  }

}