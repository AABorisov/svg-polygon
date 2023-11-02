import { ArrPoint } from "@/tools/point";
import { Visualize } from "../tools/visualize";

const elements =
  typeof window !== "undefined"
    ? [
        SVGPathElement,
        SVGRectElement,
        SVGCircleElement,
        SVGEllipseElement,
        SVGLineElement,
        SVGPolylineElement,
        SVGPolygonElement,
      ]
    : [];

function DrawSvg() {
  const polygons: ArrPoint[] = [
    [1, 0],
    [1, 100],
    [100, 0],
    [100, 100],
  ];

  return (
    <svg viewBox="0 0 700 700" width="700" height="700">
      <Visualize points={polygons} color="blue" showDots={false} />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      <h1>Your SVG here</h1>
      <div style={{ display: "flex" }}>
        <DrawSvg />
        <embed id="svg" src="/1.svg" type="image/svg+xml" />
      </div>
    </>
  );
}
