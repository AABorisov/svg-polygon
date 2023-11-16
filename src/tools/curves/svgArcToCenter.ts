import { radian } from "../geom/geom";

export type SvgArcToCenterParams = [number, number, number, number, number, number, number, number, number]
export type CenterParamObject = {
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  phi: number,
  startAngle: number,
  deltaAngle: number,
  endAngle: number,
  clockwise: boolean
}

// https://stackoverflow.com/a/12329083
//conversion_from_endpoint_to_center_parameterization
//sample :  svgArcToCenterParam(200,200,50,50,0,1,1,300,200)
// x1 y1 rx ry φ fA fS x2 y2
// φ(degree) is degrees as same as SVG not radians.
// startAngle, deltaAngle, endAngle are radians not degrees.
export function svgArcToCenterParam(params: SvgArcToCenterParams): CenterParamObject {
  let [x1, y1, rx, ry, degree, fA, fS, x2, y2] = params
  let cx: number, cy: number, startAngle: number, deltaAngle: number, endAngle: number;
  const PIx2: number = Math.PI * 2.0;
  const phi = degree * Math.PI / 180;
  const clockwise = (fS == 1)

  if (rx < 0) {
    rx = -rx;
  }
  if (ry < 0) {
    ry = -ry;
  }
  if (rx == 0.0 || ry == 0.0) { // invalid arguments
    throw Error('rx and ry can not be 0');
  }

  // SVG use degrees, if your input is degree from svg,
  // you should convert degree to radian as following line.
  // phi = phi * Math.PI / 180;
  const s_phi = Math.sin(phi);
  const c_phi = Math.cos(phi);
  const hd_x = (x1 - x2) / 2.0; // half diff of x
  const hd_y = (y1 - y2) / 2.0; // half diff of y
  const hs_x = (x1 + x2) / 2.0; // half sum of x
  const hs_y = (y1 + y2) / 2.0; // half sum of y

  // F6.5.1
  const x1_ = c_phi * hd_x + s_phi * hd_y;
  const y1_ = c_phi * hd_y - s_phi * hd_x;

  // F.6.6 Correction of out-of-range radii
  //   Step 3: Ensure radii are large enough
  const lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
  if (lambda > 1) {
    rx = rx * Math.sqrt(lambda);
    ry = ry * Math.sqrt(lambda);
  }

  const rxry = rx * ry;
  const rxy1_ = rx * y1_;
  const ryx1_ = ry * x1_;
  const sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
  if (!sum_of_sq) {
    throw Error('start point can not be same as end point');
  }
  let coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
  if (fA == fS) { coe = -coe; }

  // F6.5.2
  const cx_ = coe * rxy1_ / ry;
  const cy_ = -coe * ryx1_ / rx;

  // F6.5.3
  cx = c_phi * cx_ - s_phi * cy_ + hs_x;
  cy = s_phi * cx_ + c_phi * cy_ + hs_y;

  const xcr1 = (x1_ - cx_) / rx;
  const xcr2 = (x1_ + cx_) / rx;
  const ycr1 = (y1_ - cy_) / ry;
  const ycr2 = (y1_ + cy_) / ry;


  // F6.5.5
  startAngle = radian(1.0, 0.0, xcr1, ycr1);

  // F6.5.6
  deltaAngle = radian(xcr1, ycr1, -xcr2, -ycr2);
  // if (!clockwise) { deltaAngle = PIx2 - deltaAngle; }
  while (deltaAngle > PIx2) { deltaAngle -= PIx2; }
  while (deltaAngle < 0.0) { deltaAngle += PIx2; }
  if (fS == 0) { deltaAngle -= PIx2; }
  endAngle = startAngle + deltaAngle;
  while (endAngle > PIx2) { endAngle -= PIx2; }
  while (endAngle < 0.0) { endAngle += PIx2; }

  const outputObj = { /* cx, cy, startAngle, deltaAngle */
    cx,
    cy,
    rx,
    ry,
    phi,
    startAngle,
    deltaAngle,
    endAngle,
    clockwise
  }

  return outputObj;
}