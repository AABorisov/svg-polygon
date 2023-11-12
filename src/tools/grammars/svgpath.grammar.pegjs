// svgPathData Grammar
// ==========================
// 
// Parse svg path data to polygon with absolute cordinates in absolute values:
//   M: [x, y]
//   L: [x, y]
//   V: [0, y]
//   H: [x, 0]
//   C: []
//   Q: []
//   A: []
//   Z: [x, y] -- returns to first pair of subpath
//
//
// @input: d as SvgPathData
// @return Array<ArrPoint>
//

{{
    // Utils
    
    // types: M Z L H V C S Q T A

    // getCoord
    //
    // Get coord from data for type
    function getCoord (type, data) {
        let coord = [0, 0];
        switch (type) {
            case 'M':
            case 'L':
                coord = data
                break;
            case 'Z':
                break;
            case 'H':
                coord = [data, 0]
                break;
            case 'V':
                coord = [0, data]
                break;
            case 'C':
                coord = data[2]
                break;
            case 'S':
            case 'Q':
                coord = data[1]
                break;
            case 'T':
                coord = data
                break;
            case 'A':
                coord = data[5]
                break;
            default:
                break;
        }
        return coord
    }

    // createCommand
    //
    // @input:
    //   type: string
    //   head: string
    //   data: [] depends by type
    // @return Array<{
    //   type: string,
    //   isAbs: boolean,
    //   data: []
    //   coord: [number, number]
    // }>
    const createCommands = function createCommands(type, head, data) { 
      const isAbs = head === type

      return data.map((cmdData, index) => ({
        type: type === 'M' && index ? 'L' : type,
        isAbs,
        data: cmdData,
        coord: getCoord(type, cmdData)
      }))
    }
}}

svg_path
    = wsp* subpaths:subpath*
    { return subpaths }

subpath =  m:moveto draws:(wsp* @drawto_command)* cp:closepath?
    { 
      const drawCmds = draws.reduce((acc, cmd) => [...acc, ...cmd], []) 
      return [...m, ...drawCmds, ...(cp||[])]
    }


drawto_command
    = lineto
    / horizontal_lineto
    / vertical_lineto
    / curveto
    / smooth_curveto
    / quadratic_bezier_curveto
    / smooth_quadratic_bezier_curveto
    / elliptical_arc

moveto
    = head:( "M" / "m" ) wsp* coords:coordinate_pair_sequence
    { return createCommands('M', head, coords) }

closepath=
    head:("Z" / "z")
    { return createCommands('Z', head, [head]) }

lineto=
    head:("L"/"l") wsp* coords:coordinate_pair_sequence
    { return createCommands('L', head, coords) }

horizontal_lineto=
    head:("H"/"h") wsp* coords:coordinate_sequence
    { return createCommands('H', head, coords) }

vertical_lineto=
    head:("V"/"v") wsp* coords:coordinate_sequence
    { return createCommands('V', head, coords) }

curveto=
    head:("C"/"c") wsp* coords:curveto_coordinate_sequence
    { return createCommands('C', head, coords) }

curveto_coordinate_sequence=
    coordinate_pair_triplet|.., comma_wsp?|

smooth_curveto=
    head:("S"/"s") wsp* coords:smooth_curveto_coordinate_sequence
    { return createCommands('S', head, coords) }

smooth_curveto_coordinate_sequence=
    coordinate_pair_double|.., comma_wsp?|

quadratic_bezier_curveto=
    head:("Q"/"q") wsp* coords:quadratic_bezier_curveto_coordinate_sequence
    { return createCommands('Q', head, coords) }

quadratic_bezier_curveto_coordinate_sequence=
    coordinate_pair_double|.., comma_wsp?|

smooth_quadratic_bezier_curveto=
    head:("T"/"t") wsp* coords:coordinate_pair_sequence
    { return createCommands('T', head, coords) }

elliptical_arc=
    head:( "A" / "a" ) wsp* coords:elliptical_arc_argument_sequence
    { return createCommands('A', head, coords) }

elliptical_arc_argument_sequence=
    elliptical_arc_argument|.., comma_wsp?|

elliptical_arc_argument=
    @number comma_wsp? @number comma_wsp? @number comma_wsp
    @flag comma_wsp? @flag comma_wsp? @coordinate_pair

coordinate_pair_double=
	coordinate_pair|2, comma_wsp?|

coordinate_pair_triplet=
	coordinate_pair|3, comma_wsp?|

coordinate_pair_sequence=
    coordinate_pair|.., comma_wsp?|

coordinate_sequence
    = coordinate|.., comma_wsp?|

coordinate_pair= coordinate|2, comma_wsp?|

coordinate= sign? number
    { return parseFloat(text())}

exponent= ("e" / "E") sign? digit+

sign= "+"/"-"

number= fractional_constant exponent?
    { return parseFloat(text())}

fractional_constant= (digit* "." digit+) / digit+

flag= ("0" / "1")

comma_wsp= (wsp+ ","? wsp*) / ("," wsp*)

digit= "0" / "1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9"

wsp "whitespace"
    = [ \t\n\r]