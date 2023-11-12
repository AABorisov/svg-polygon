
export enum CmdType {
  M = "M",
  Z = "Z",
  L = "L",
  H = "H",
  V = "V",
  C = "C",
  S = "S",
  Q = "Q",
  T = "T",
  A = "A"
}

export type TMiddleCmdType = CmdType.L | CmdType.H | CmdType.V | CmdType.C | CmdType.S | CmdType.Q | CmdType.T | CmdType.A

export type TCurvesCmdTypes = CmdType.C | CmdType.S | CmdType.Q | CmdType.T | CmdType.A

export type TCommandData<T extends CmdType> = 
  T extends CmdType.M | CmdType.L | CmdType.T ? CoordinatePairSequence : 
  T extends CmdType.H | CmdType.V ? CoordinateSequence :
  T extends CmdType.C ? CurvetoCoordinateSequence :
  T extends CmdType.S | CmdType.Q ? CoordinatePairDoubleSequence :
  T extends CmdType.A ? EllipticalArcArgumentSequence :
  T extends CmdType.Z ? [string] : never

export type TCmdData<T extends CmdType> = TCommandData<T>[0]

export interface Command<T extends CmdType> {
  type: T
  data: TCmdData<T>
  coord: CoordinatePair
  isAbs: boolean
}
type TCreateCommandsHead<T extends CmdType> = T | Lowercase<T>
export type TCreateCommandsReturn<T extends CmdType> = 
  T extends CmdType.M ? [Command<T>, ...Command<CmdType.L>[]] : Command<T>[]

type TCreateCommands<T extends CmdType> = 
  (type: T, head: TCreateCommandsHead<T>, data: TCommandData<T>[]) => TCreateCommandsReturn<T>



export type TSvgPath = TSubpath[];
export type TSubpath = [Command<CmdType.M>, ...Command<TMiddleCmdType>[], TClosepath[0]] | [Command<CmdType.M>, ...Command<TMiddleCmdType>[]];
export type TSubpathGen = Command<CmdType>[]


export type DrawtoCommand =
  | Lineto
  | HorizontalLineto
  | VerticalLineto
  | Curveto
  | SmoothCurveto
  | QuadraticBezierCurveto
  | SmoothQuadraticBezierCurveto
  | EllipticalArc;
export type Moveto = TCreateCommandsReturn<CmdType.M>;
export type TClosepath = TCreateCommandsReturn<CmdType.Z>;
export type Lineto = TCreateCommandsReturn<CmdType.L>;
export type HorizontalLineto = TCreateCommandsReturn<CmdType.H>;
export type VerticalLineto = TCreateCommandsReturn<CmdType.V>;
export type Curveto = TCreateCommandsReturn<CmdType.C>;
export type SmoothCurveto = TCreateCommandsReturn<CmdType.S>;
export type QuadraticBezierCurveto = TCreateCommandsReturn<CmdType.Q>;
export type SmoothQuadraticBezierCurveto = TCreateCommandsReturn<CmdType.T>;
export type EllipticalArc = TCreateCommandsReturn<CmdType.A>;

export type CurvetoCoordinateSequence = CoordinatePairTriplet[];
export type SmoothCurvetoCoordinateSequence = CoordinatePairDoubleSequence;
export type QuadraticBezierCurvetoCoordinateSequence = CoordinatePairDoubleSequence;
export type EllipticalArcArgumentSequence = EllipticalArcArgument[];
export type EllipticalArcArgument = [number, number, number, number, number, CoordinatePair];
export type CoordinatePairDoubleSequence = CoordinatePairDouble[]
export type CoordinatePairDouble = [CoordinatePair, CoordinatePair];
export type CoordinatePairTriplet = [CoordinatePair, CoordinatePair, CoordinatePair];
export type CoordinatePairSequence = CoordinatePair[];
export type CoordinateSequence = Coordinate[];
export type CoordinatePair = [Coordinate, Coordinate];
export type Coordinate = number;
export type Flag = "0" | "1";