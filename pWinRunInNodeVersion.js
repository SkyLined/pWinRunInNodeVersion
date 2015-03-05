var fRunInNodeVersion = require("./fRunInNodeVersion.js");

var sProcessorArchitecture;
switch (process.argv[2].toLowerCase()) {
  case "x86": case "ia32": sProcessorArchitecture = "ia32"; break;
  case "x64": case "amd64": sProcessorArchitecture = "x64"; break;
  default:
    console.log("Unknown processor architecture " + process.argv[2]);
    process.exit(1);
}
var oVersionMatch = process.argv[3].match(/^v?(\d+)\.(\d+)(?:\.(?:(\d+)|x|\*))?$/i);
if (!oVersionMatch) {
  console.log("Unknown node version " + process.argv[3]);
}
var asVersion = oVersionMatch.slice(1, 4);
var asArguments = process.argv.splice(4);
fRunInNodeVersion(sProcessorArchitecture, asVersion, asArguments);
