const fs = require("fs");
const http = require("http");
const https = require("https");
const urlModule = require("url");

if (process.argv.length !== 3) {
  console.error("Usage: node urls.js FILENAME");
  process.exit(1);
}

const filename = process.argv[2];

try {
  const data = fs.readFileSync(filename, "utf8");
  const urls = data.split("\n").filter((url) => url.trim() !== "");

  urls.forEach(async (url) => {
    const hostname = urlModule.parse(url).hostname;
    const outputFilename = `${hostname}.txt`;

    try {
      const protocol = url.startsWith("https") ? https : http;
      const response = await new Promise((resolve, reject) => {
        protocol.get(url, resolve).on("error", reject);
      });

      let html = "";
      response.on("data", (chunk) => {
        html += chunk;
      });

      response.on("end", () => {
        fs.writeFileSync(outputFilename, html);
        console.log(`Wrote to ${outputFilename}`);
      });
    } catch (error) {
      console.error(`Couldn't download ${url}`);
    }
  });
} catch (error) {
  console.error(`Error reading file: ${filename}`);
  process.exit(1);
}
