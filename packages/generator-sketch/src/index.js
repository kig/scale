const {
  Sketch,
  Page,
  Rect,
  Style,
  Artboard,
  SharedStyle,
  SymbolMaster,
  SymbolInstance,
} = require("sketch-constructor");
const fs = require("fs");
const json = require("../sketch-json/asketch.json");
const directory = "sketch";
const sketch = new Sketch();
const uuid = require("uuid").v4;

if (!fs.existsSync(directory)) {
  console.log(`generating directory: ${directory}`);
  fs.mkdirSync(`${process.cwd()}/${directory}`, { recursive: true });
}

const symbolMaster = (args) => {
  const {name, id, layers, height, width, x, y} = args
  const symbol = new SymbolMaster({
    id,
    name,
    frame: {
      x,
      y,
      width,
      height
    },
    ...args
  });
  // symbol.groupLayout = {
  //   _class: "MSImmutableInferredGroupLayout",
  //   axis: 0,
  //   layoutAnchor: 0,
  //   maxSize: 0,
  //   minSize: 0
  // }
  return symbol;
};

const excludeKeys = new Set(['_class', 'do_objectID', 'name', 'text']);
// Set instance frame size and overrides
function fillInstance(instance, symbol, json, objectID = '') {
  const keys = Object.keys(json);
  for (let i = 0 ; i < keys.length; i++) {
    const key = keys[i];
    const symbolValue = symbol[key];
    const jsonValue = json[key];
    if (key === 'do_objectID') {
      objectID = symbolValue;
    }
    if (Array.isArray(jsonValue)) {
      jsonValue.forEach((nestedJson, i) => fillInstance(instance, symbolValue[i], nestedJson, objectID));
    } else if (!excludeKeys.has(key) && typeof symbolValue === 'string' && symbolValue !== jsonValue) {
      console.log(instance.name, instance.do_objectID, '-- override', key, ':',  symbolValue, '=>', jsonValue);
      const override = {
        "_class": "overrideValue",
        "overrideName": `${objectID}_${key}Value`,
        "value": jsonValue
      };
      instance.overrideValues.push(override);
    } else if (typeof symbolValue === 'object') {
      fillInstance(instance, symbolValue, jsonValue, objectID);
    }
  }
}

const symbols = new Map();

function enhanceJson(json) {
  let enhanced = {};
  const keys = Object.keys(json);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = json[key];
    if (Array.isArray(value)) {
      enhanced[key] = value.map(nestedJson => enhanceJson(nestedJson))
    } else if (key === '_class' && value === 'group' && json.isSymbol === true) {
      let symbol = symbols.get(json.name);
      if (!symbol) {
        const args = {...json};
        symbol = symbolMaster(args);
        symbols.set(json.name, symbol);
      }
      const instance = symbol.createInstance({name: json.name});
      instance.frame = new Rect(json.frame);
      instance.style = new Style(json.style);
      fillInstance(instance, symbol, json);
      return instance;
    } else {
      enhanced[key] = value
    }
  }
  return enhanced;
}

const symbolsPage = new Page({
  name: "Symbols"
});

const componentsPage = new Page({
  name: "Components"
});

const artboardComponents = new Artboard({
  name: "Components",
  frame: {
    width: json.frame.width,
    height: json.frame.height
  }
});

const enhanced = enhanceJson(json);
fs.writeFileSync('./debug.json', JSON.stringify(enhanced, null, 4))

enhanced.layers.forEach(layer => artboardComponents.addLayer(layer));
for (const symbol of symbols.values()) {
  symbolsPage.addLayer(symbol);
}
// console.log(JSON.stringify(symbolsPage, null, 4));

componentsPage.addArtboard(artboardComponents);
sketch.addPage(symbolsPage);
sketch.addPage(componentsPage);
sketch.build("./sketch/scale.sketch").then(() => {
  console.log("Built components sketch document!");
});
