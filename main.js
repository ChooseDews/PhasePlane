import * as PIXI from "pixi.js";
import * as math from "mathjs";
import Vue from "vue/dist/vue.js";
let x_prime_str = "x-y-x*(3*(x^2+y^2)-(x^2+y^2)^2-1)"; //'2(1-x*x)*y' //"2x-3y+x*y";
let y_prime_str = "x+y-y*(3*(x^2+y^2)-(x^2+y^2)^2-1)";
let f, g;
var width = window.innerWidth - 2;
var height = window.innerHeight - 102;
let x_bounds = [-4, 4];
let y_bounds = [-4, 4];
let range = a => a[1] - a[0];
let x_range, y_range;
let x_unit_pixels, y_unit_pixels;

let map = function(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};

let checks = function() {
  if ([...x_bounds, ...y_bounds].filter(x => !Number(x) || isNaN(x)).length > 0)
    throw "Invalid Bounds";
};

let defineFunctions = x => {
  const parser = math.parser();
  parser.evaluate("f(x, y) = " + x_prime_str); // f(x, y)
  parser.evaluate("g(x, y) = " + y_prime_str); // f(x, y)
  f = parser.get("f");
  g = parser.get("g");

  x_range = range(x_bounds);
  y_range = range(y_bounds);
  x_unit_pixels = width / x_range;
  y_unit_pixels = height / y_range;
};

let coordinateTransform = ([x, y]) => {
  return [
    map(x, x_bounds[0], x_bounds[1], 0, width),
    height - map(y, y_bounds[0], y_bounds[1], 0, height)
  ];
};

var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();

var renderer = PIXI.autoDetectRenderer({
  backgroundColor: 0x000000,
  antialias: true,
  width,
  height
});

document.body.appendChild(renderer.view);

// Create the main stage for your display objects
var stage = new PIXI.Container();

// Initialize the pixi Graphics class

// Set the fill color

let drawPoint = (x, c, r) => {
  let graphics = new PIXI.Graphics();
  graphics.beginFill(c || 0xe74c3c); // Red
  graphics.drawCircle(...coordinateTransform(x), r || 1); // drawCircle(x, y, radius)
  graphics.endFill();
  stage.addChild(graphics);
};

let drawLine = (from, to, color, t) => {
  var line = new PIXI.Graphics();
  from = coordinateTransform(from);
  to = coordinateTransform(to);
  line.lineStyle(t || 1, color || 0xd5402b, 1);
  line.moveTo(from[0], from[1]);
  line.lineTo(to[0], to[1]);
  stage.addChild(line);
};

let drawXAxis = (color, t) => {
  drawLine([x_bounds[0], 0], [x_bounds[1], 0], color || 0xffffff, t || 1);
};
let drawYAxis = (color, t) => {
  drawLine([0, y_bounds[0]], [0, y_bounds[1]], color || 0xffffff, t || 1);
};

let drawYAxisText = (color, t, interval) => {
  if (!interval) interval = y_range / 20;
  if (x_range > 2) interval = math.ceil(interval);
  for (let i = y_bounds[0]; i <= y_bounds[1]; i = i + interval) {
    if (i == 0) continue;
    drawText([4 / x_unit_pixels, i + 4 / x_unit_pixels], math.round(i, 2), 10);
  }
};

let drawXAxisText = (color, t, interval) => {
  if (!interval) interval = x_range / 20;
  if (x_range > 2) interval = math.ceil(interval);
  for (let i = x_bounds[0]; i <= x_bounds[1]; i = i + interval) {
    drawText([i + 4 / x_unit_pixels, 11 / y_unit_pixels], math.round(i, 2), 10);
  }
};

let drawText = (point, text, size, color, family) => {
  point = coordinateTransform(point);
  let t = new PIXI.Text(text, {
    fontFamily: "Arial",
    fontSize: size || 24,
    fill: color || 0xffffff
  });
  t.position.x = point[0];
  t.position.y = point[1];
  stage.addChild(t);
};

let drawFieldPoint = (point, f, g, l) => {
  if (!l) l = 12;
  let x_s = f(...point);
  let y_s = g(...point);
  let mag = math.sqrt(x_s * x_s + y_s * y_s);
  let angle = math.atan2(y_s, x_s);
  let x_rise = (math.cos(angle) * l) / x_unit_pixels / 2;
  let y_rise = (math.sin(angle) * l) / y_unit_pixels / 2;
  drawLine(
    [point[0] - x_rise, point[1] - y_rise],
    [point[0] + x_rise, point[1] + y_rise]
  );
  drawPoint([point[0] + x_rise, point[1] + y_rise], 0xff8c00, 1);
};

let drawAllFeildPoints = interval => {
  let interval_x = x_range / 40;
  let interval_y = y_range / 40;

  for (let i = x_bounds[0]; i <= x_bounds[1]; i = i + interval_x) {
    for (let j = y_bounds[0]; j <= y_bounds[1]; j = j + interval_y) {
      drawFieldPoint([i, j], f, g);
    }
  }
};

let partical = [0.1, 0.1];
let stepPatical = function() {
  let time = 0.05;
  let x_step = f(...partical) * time;
  let y_step = g(...partical) * time;
  partical = [partical[0] + x_step, partical[1] + y_step];
};

let drawPartical = function() {
  drawPoint(partical, 0x00ff00, 1);
};

setInterval(function() {
  for (let step = 0; step < 2; step++) {
    stepPatical();
  }
  if (
    partical[0] > x_bounds[1] ||
    partical[0] < x_bounds[0] ||
    partical[1] > y_bounds[1] ||
    partical[1] < y_bounds[0]
  ) {
  } else {
    drawPartical();
    renderer.render(stage);
  }
}, 200);

let runtime = () => {
  console.time("Computing Functions");
  defineFunctions();
  console.timeEnd("Computing Functions");
  console.time("Drawing Axis");

  checks();

  drawXAxis();
  drawYAxis();
  drawYAxisText();
  drawXAxisText();

  console.timeEnd("Drawing Axis");
  console.time("Drawing Feild");

  drawAllFeildPoints();
  console.timeEnd("Drawing Feild");

  drawPoint([0, 0], 0x4ce73c, 3);
};

let clear = () => {
  while (stage.children.length > 0) {
    var child = stage.getChildAt(0);
    stage.removeChild(child);
  }
};

var app = new Vue({
  data() {
    return {
      text: "Hello, World",
      x_prime: x_prime_str,
      y_prime: y_prime_str,
      x_range: x_bounds[0] + "," + x_bounds[1],
      y_range: y_bounds[0] + "," + y_bounds[1],
      p_range: partical[0] + "," + partical[1]
    };
  },
  methods: {
    update() {
      try {
        x_prime_str = this.x_prime;
        y_prime_str = this.y_prime;
        const parser = math.parser();

        partical = [0.1, 0.1];

        let x = this.x_range.split(",");
        let y = this.y_range.split(",");
        x_bounds = [math.evaluate(x[0]), math.evaluate(x[1])].map(Number);
        y_bounds = [math.evaluate(y[0]), math.evaluate(y[1])].map(Number);

        let p = this.p_range.split(",");
        partical = [math.evaluate(p[0]), math.evaluate(p[1])].map(Number);

        clear();
        runtime();
        renderer.render(stage);
      } catch (e) {
        console.error(e);
        alert("Failed To Plot: \n" + String(e));
      }
    }
  },
  created() {
    runtime();
    renderer.render(stage);
  }
}).$mount("#app");
