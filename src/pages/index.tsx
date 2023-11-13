import React, { useEffect, useState } from "react";
import { parseSvg } from "@/tools/parseSvg";
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

type TDrawSvgProps = {
  src: string
}

function DrawSvg({ src }: TDrawSvgProps) {
  const [polygons, setPolygons] = useState<ArrPoint[][]>([[
    [1, 0],
    [1, 100],
    [100, 0],
    [100, 100],
  ]])

  useEffect(() => {
    fetch(src)
      .then(response => response.text())
      .then((text) => {
        var parser = new DOMParser();
        return parser.parseFromString(text, "image/svg+xml");
      }).then((doc) => {
        const svg: SVGSVGElement = doc.getElementsByTagName('svg')[0];
        return svg
      })
      .then(parseSvg)
      .then((result) => {
        setPolygons(result)
      })
  }, [])

  return (
    <svg viewBox="0 0 700 700" width="700" height="700">
      {polygons.map((polygon, index) => (
        <Visualize points={polygon} key={index} color="blue" showDots={false} />
      ))}
    </svg>
  );
}

export default function Home() {
  const srcs = [
    "/test/polygon_intersect.svg"
    // "/1.svg", 
  // "/2.svg", "/3.svg"
]
  return (
    <>
      <h1>Your SVG here</h1>
      {
        srcs.map((src) => {
          return (
            <div style={{ display: "flex" }} key={src}>
              <DrawSvg src={src} />
              <embed id={src} src={src} type="image/svg+xml" />
            </div>
          )
        })
      }
    </>
  );
}
