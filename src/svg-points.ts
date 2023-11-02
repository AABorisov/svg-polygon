export default function getPoints(str) {
  str = str
    .replace(/[0-9]+-/g, function (v) {
      return v.slice(0, -1) + " -";
    })
    .replace(/\.[0-9]+/g, function (v) {
      return v.match(/\s/g) ? v : v + " ";
    });

  var keys = str.match(/[MmLlHhVv]/g);
  var paths = str
    .split(/[MmLlHhVvZz]/g)
    .filter(function (v) {
      return v.length > 0;
    })
    .map(function (v) {
      return v.trim();
    });

  var x = 0,
    y = 0,
    res = "";
  for (var i = 0, lenKeys = keys.length; i < lenKeys; i++) {
    switch (keys[i]) {
      case "M":
      case "L":
      case "l":
        var arr = paths[i].split(/\s/g).filter(function (v) {
          return v.length > 0;
        });
        for (var t = 0, lenPaths = arr.length; t < lenPaths; t++) {
          if (t % 2 === 0) {
            x = (keys[i] == "l" ? x : 0) + parseFloat(arr[t]);
            res += x;
          } else {
            y = (keys[i] == "l" ? y : 0) + parseFloat(arr[t]);
            res += y;
          }
          if (t < lenPaths - 1) res += " ";
        }
        break;
      case "V":
        y = parseFloat(paths[i]);
        res += x + " " + y;
        break;
      case "v":
        y += parseFloat(paths[i]);
        res += x + " " + y;
        break;
      case "H":
        x = parseFloat(paths[i]);
        res += x + " " + y;
        break;
      case "h":
        x += parseFloat(paths[i]);
        res += x + " " + y;
        break;
    }
    if (i < lenKeys - 1) res += " ";
  }

  return res;
}
