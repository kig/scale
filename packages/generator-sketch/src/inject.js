const nodeTreeToSketchPage = require("@scaleds/html-to-sketch")
  .nodeTreeToSketchPage;
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const URL = require("url").URL;
const DEBUG = false;
const crypto = require("crypto");

let server;

if (process.argv.length > 2 && /^https?:/i.test(process.argv[2])) {
  server = {
      pageURLs: process.argv.slice(2),
      close: () => {}
  };
} else {
  const root = (process.argv[2] || path.join(__dirname, "../sketch-render"));
  const port = 3334;

  server = require("./renderserver")(root, port);
}

let urlObj = null;
let directory = "sketch-json";

if (!fs.existsSync(directory)) {
  console.log(`generating directory: ${directory}`);
  fs.mkdirSync(`${process.cwd()}/${directory}`, { recursive: true });
}

const outdirPath = path.resolve(__dirname, `./../${directory}`)
fs.readdirSync(outdirPath).forEach(fn => {
  fs.unlinkSync(path.resolve(outdirPath, fn));
});

function delay(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

puppeteer
  .launch({ headless: !!!DEBUG ? true : false })
  .then(async (browser) => {
    let pageIndex = 0;
    for (const url of server.pageURLs) {
      pageIndex++;
      const outputFile = `./../${directory}/page-${pageIndex}.json`;
      try {
        console.log("Processing page", url);
        const page = await browser.newPage();

        if (!!!DEBUG) {
          page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
        }

        page.on("response", async (response) => {
          const url = response.url();
          if (response.request().resourceType() === "image") {
            response.buffer().then((file) => {
              const fileName = crypto
                .createHash("sha1")
                .update(url)
                .digest("hex");
              const filePath = path.resolve(
                __dirname,
                `./../${directory}/${fileName}`
              );
              fs.writeFileSync(filePath, file);
            });
          }
        });

        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, {
          waitUntil: "networkidle2",
        });

        await page.addScriptTag({
          path: "./dist/build/page2layers.bundle.js",
        });


        const cdp = await page.target().createCDPSession();

        await cdp.send("DOM.enable");
        await cdp.send("CSS.enable");

        const domNodes = {};
        const nodesByParent = {};

        const nodes = (await cdp.send("DOM.getFlattenedDocument", {depth: -1, pierce: true})).nodes;
        nodes.forEach(n => {
          domNodes[n.nodeId] = n;
          if (!nodesByParent[n.parentId]) nodesByParent[n.parentId] = [];
          nodesByParent[n.parentId].push(n);
        });
        const docNodeId = nodes[nodes.length-1].nodeId;

        const states = ["hover", "active", "focus", "focus-within"];
        for (let i = 0; i < states.length; i++) {
          const state = states[i];

          const nodeIds = (
            await cdp.send("DOM.querySelectorAll", {
              nodeId: docNodeId,
              selector: `[data-sketch-state="${state}"]`,
            })
          ).nodeIds;

          for (const nodeId of nodeIds) {
            await cdp.send("CSS.forcePseudoState", {
              nodeId: nodeId,
              forcedPseudoClasses: [state],
            });
            const node = domNodes[nodeId];
            if (node.shadowRoots && node.shadowRoots[0]) {
              const shadowNodes = nodesByParent[node.shadowRoots[0].nodeId];
              for (const node of shadowNodes) {
                await cdp.send("CSS.forcePseudoState", {
                  nodeId: node.nodeId,
                  forcedPseudoClasses: [state],
                });
              }
            }
          }
        }
        await delay(3000); // Wait a bit for relayout


        const asketchPage = await page.evaluate("page2layers.run()");

        fs.writeFileSync(
          path.resolve(__dirname, outputFile),
          JSON.stringify(asketchPage)
        );
      } catch (e) {
        console.log(e);
      }
    }

    if (!!!DEBUG) {
      await browser.close();
    }
    server.close();
  });
