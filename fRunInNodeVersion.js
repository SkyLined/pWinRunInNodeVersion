var oChildProcess = require("child_process"),
    oFS = require("fs"),
    oHTTPS = require("https"),
    oPath = require("path");

function fRunInNodeVersion(sProcessorArchitecture, asVersion, asArguments) {
  if (asVersion[2] !== undefined) {
    fGetAndRunVersion(sProcessorArchitecture, asVersion, asArguments);
  } else {
    fFindAvailableVersion(asVersion, function (asVersion) {
      fGetAndRunVersion(sProcessorArchitecture, asVersion, asArguments);
    });
  }
}
function fGetAndRunVersion(sProcessorArchitecture, sVersion, asArguments) {
  fGetNodeExe(sProcessorArchitecture, sVersion, function (sFilePath) {
    fRunNodeExe(sFilePath, asArguments);
  });
}
function fFindAvailableVersion(asVersion, fCallback) {
  // The last digit in asVersion is not set: see if there is a node.exe version
  // that for the mayor and minor number and use that or set the last digit to
  // 0.
  var sBasePath = __dirname + "\\bin\\" + sProcessorArchitecture;
  oFS.readdir(sBasePath, function (oError, asAvailableVersions) {
    if (oError) throw oError;
    if (!asAvailableVersions.some(function (sVersion) {
      var oVersionMatch = sVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (oVersionMatch) {
        if (oVersionMatch[1] == asVersion[0] && oVersionMatch[2] == asVersion[1]) {
          asVersion[2] = oVersionMatch[3];
          return true;
        }
      }
      return false;
    })) {
      asVersion[2] = 0;
    }
    fCallback(asVersion);
  });
}
function fGetNodeExe(sProcessorArchitecture, asVersion, fCallback) {
  var sVersion = asVersion.join(".");
  var sFolderPath = __dirname + "\\bin\\" + sProcessorArchitecture + "\\" + sVersion;
  var sFilePath = sFolderPath + "\\node.exe";
  oFS.stat(sFilePath, function (oError, oStats) {
    if (!oError && oStats.isFile()) {
      fCallback(sFilePath);
    } else {
      fCreateFolder(sFolderPath, function () {
        fDownloadNodeExe(sProcessorArchitecture, sVersion, sFilePath, function () {
          fCallback(sFilePath);
        });
      });
    }
  });
}
function fCreateFolder(sFolderPath, fCallback) {
  oFS.stat(sFolderPath, function (oError, oStats) {
    if (!oError && oStats.isDirectory()) {
      fCallback();
    } else {
      // Folder not found, make the parent folder first if needed.
      var sParentFolder = oPath.dirname(sFolderPath);
      if (sParentFolder == sFolderPath) fCallback(); // Cannot create root
      fCreateFolder(sParentFolder, function () {
        oFS.mkdir(sFolderPath, function (oError) {
          if (oError) throw oError;
          fCallback();
        });
      });
    }
  });
}

function fDownloadNodeExe(sProcessorArchitecture, sVersion, sFilePath, fCallback) {
  var sNodeJSCertificate = oFS.readFile(__dirname + "\\nodejs.org.crt", function (oError, sCertificate) {
    if (oError) throw oError;
    var oRequest = oHTTPS.request({
      "hostname": "nodejs.org",
      "port": 443,
      "path": "/dist/v" + sVersion + (sProcessorArchitecture == "x64" ? "/x64" : "") + "/node.exe",
      "method": "GET",
      "cert": sCertificate,
    });
    oRequest.on("response", function(oResponse) {
      if (oResponse.statusCode != 200) {
        throw new Error("Cannot download node.exe v" + sVersion + ": HTTP " + oResponse.statusCode);
      }
      var oFile = oFS.createWriteStream(sFilePath);
      oResponse.pipe(oFile);
      oFile.on("finish", function() {
        oFile.close(function() {
          fCallback();
        });
      });
    });
    oRequest.on("error", function (oError) {
      throw oError;
    });
    oRequest.end();
  });
}

function fRunNodeExe(sFilePath, asArguments) {
  oChildProcess.spawn(sFilePath, asArguments, { "stdio": "inherit" });
}

module.exports = fRunInNodeVersion;