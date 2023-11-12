import { FC } from "react";
import { ArrPoint } from "./point";

interface VisualizeProps {
  points: ArrPoint[];
  color: string;
  showDots?: boolean;
}

export const Visualize: FC<VisualizeProps> = ({ points, color, showDots }) => {

  return (
    <>
      <polygon
        points={points.map(([x, y]) => `${x} ${y}`).join(" ")}
        fill="rgba(0, 0, 0, 0.1)"
        stroke={color}
        strokeWidth="1px"
      />
      {showDots &&
        points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2px" stroke={color} fill="none" />
        ))}
    </>
  );
};

interface VisualizeLineProps {
  lines: [ArrPoint, ArrPoint][];
  color: string;
}

export const VisualizeLines: FC<VisualizeLineProps> = ({ lines, color }) => {
  return (
    <g>
      {lines.map(([[x1, y1], [x2, y2]], i) => (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={color}
          strokeWidth="1px"
        />
      ))}
    </g>
  );
};
