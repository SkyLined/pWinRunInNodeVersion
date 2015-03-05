var fRunInNodeVersion = require("./fRunInNodeVersion.js");

var sProcessorArchitecture = "x64";
var oVersionMatch = process.argv[2].match(/^v?(\d+)\.(\d+)(?:\.(?:(\d+)|x|\*))?$/i);
if (!oVersionMatch) {
  console.log("Unknown node version " + process.argv[2]);
}
var asVersion = oVersionMatch.slice(1, 4);
var asArguments = process.argv.splice(3);
fRunInNodeVersion(sProcessorArchitecture, asVersion, asArguments);
