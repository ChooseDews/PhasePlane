//Plot dependencies
import * as PIXI from "pixi.js";
import * as math from "mathjs";

//App imports
import Vue from "vue/dist/vue.js";
import Favorites from "./favorites.vue"; //parcle has a build in vue compiler

//Define init functions & bounds
let x_prime_str = "x-y-x*(3*(x^2+y^2)-(x^2+y^2)^2-1)"; //'2(1-x*x)*y' //"2x-3y+x*y";
let y_prime_str = "x+y-y*(3*(x^2+y^2)-(x^2+y^2)^2-1)";
let f, g;
let width = window.innerWidth - 2;
let height = window.innerHeight - 102;
let x_bounds = [-4, 4];
let y_bounds = null;
let loops = 0;
let limit = 10 ** 6;
let particle = [0.1, 0.1];

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
    x_unit_pixels = width / x_range;
    //auto calculate y_bounds to match unit_pixels this should happen most times!
    if (!y_bounds) {
        y_range = math.round(height / x_unit_pixels, 2);
        y_bounds = [-y_range / 2, y_range / 2];
    }
    y_range = range(y_bounds);
    y_unit_pixels = height / y_range;

};

//init the function so all vars are primed
defineFunctions();

//transform 2d points into canvas px locations
let coordinateTransform = ([x, y]) => {
    return [
        map(x, x_bounds[0], x_bounds[1], 0, width),
        height - map(y, y_bounds[0], y_bounds[1], 0, height)
    ];
};


//Init PIXI 
let stage = new PIXI.Container();
let graphics = new PIXI.Graphics();
let renderer = PIXI.autoDetectRenderer({
    backgroundColor: 0x000000,
    antialias: true,
    width,
    height
});
document.body.appendChild(renderer.view);



//All these are helper functions to plot points, lines, and axis
let drawPoint = (x, c, r) => {
    let graphics = new PIXI.Graphics();
    graphics.beginFill(c || 0xe74c3c); // Red
    graphics.drawCircle(...coordinateTransform(x), r || 1); // drawCircle(x, y, radius)
    graphics.endFill();
    stage.addChild(graphics);
};


let drawLine = (from, to, color, t) => {
    let line = new PIXI.Graphics();
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
    let s = y_bounds[0];
    if (y_range > 2) {
        interval = math.ceil(interval);
        s = math.ceil(s);
    }

    for (let i = s; i <= y_bounds[1]; i = i + interval) {
        if (i == 0) continue;
        drawText([4 / x_unit_pixels, i + 4 / x_unit_pixels], math.round(i, 2), 10);
    }
};

let drawXAxisText = (color, t, interval) => {
    if (!interval) interval = x_range / 20;
    let s = x_bounds[0];
    if (x_range > 2) {
        interval = math.ceil(interval);
        s = math.ceil(s);
    }
    for (let i = s; i <= x_bounds[1]; i = i + interval) {
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

let drawAllFieldPoints = interval => {
    let interval_x = x_range / 40;
    let interval_y = y_range / 40;

    for (let i = x_bounds[0]; i <= x_bounds[1]; i = i + interval_x) {
        for (let j = y_bounds[0]; j <= y_bounds[1]; j = j + interval_y) {
            drawFieldPoint([i, j], f, g);
        }
    }
};


let stepParticle = function() {
    let time = 0.00005;
    let x_step = f(...particle) * time;
    let y_step = g(...particle) * time;
    particle = [particle[0] + x_step, particle[1] + y_step];
};

let drawParticle = function(p) {
    drawPoint(p || particle, 0x00ff00, 1);
};

let runSteps = function(n) {
    for (let i = 0; i < n; i++) {
        loops++;
        stepParticle();
    }
}

let gatherPoints = function(times, pointCount) {
    let points = [];
    for (let s = 0; s < pointCount; s++) {
        runSteps(times);
        points.push([...particle]);
    }
    return points;
}

let plotPoints = function(points) {
    for (let point of points) drawParticle(point);
}

let clear = () => {
  while (stage.children.length > 0) {
      let child = stage.getChildAt(0);
      stage.removeChild(child);
  }
}

let delay = function(amount) {
    return new Promise(function(go) {
        setTimeout(go, amount);
    })
}

let frame = function() {
    let points = gatherPoints(200, 50);
    let f = points[0];

    //bounds checks if the start of end of the 50 fetched points are within frame
    
    let bounds = 0;
    if (
        particle[0] > x_bounds[1] ||
        particle[0] < x_bounds[0] ||
        particle[1] > y_bounds[1] ||
        particle[1] < y_bounds[0]
    ) bounds++;

    if (
        f[0] > x_bounds[1] ||
        f[0] < x_bounds[0] ||
        f[1] > y_bounds[1] ||
        f[1] < y_bounds[0]
    ) bounds++;

    //if at least one is in frame -> plot them all
    if (bounds < 2) {
        plotPoints(points);
        renderer.render(stage);
    }

    //this delay is just to slow things down a bit
    delay(100).then(function() {
        if (loops < limit) { //the limit is how many total steps it wil take any numerical solution
            window.requestAnimationFrame(frame); //ensures we don't over do the machine
        } else {
            console.log('Over Limit - Animation Stopped'); 
        }
    });

};

let runtime = () => { //Setup the plane with axis and field lines
    console.time("Drawing Plot & Field");
    defineFunctions();
    checks();
    drawXAxis();
    drawYAxis();
    drawYAxisText();
    drawXAxisText();
    drawAllFieldPoints();
    drawPoint([0, 0], 0x4ce73c, 3);
    console.timeEnd("Drawing Plot & Field");
};


let app = new Vue({
    data() {
        return {
            showExamples: false,
            x_prime: x_prime_str,
            y_prime: y_prime_str,
            x_range: x_bounds[0] + "," + x_bounds[1],
            y_range: y_bounds[0] + "," + y_bounds[1],
            p_range: particle[0] + "," + particle[1]
        };
    },
    methods: {
        toggleExample() {
            this.showExamples = !this.showExamples;
        },
        select(x_p, y_p, x_range, p_start) { //get params from favorites list and auto fill
            this.x_prime = x_p;
            this.y_prime = y_p;
            this.x_range = x_range[0] + "," + x_range[1];
            this.p_range = p_start[0] + "," + p_start[1];
            this.showExamples = false;
            y_bounds = null;
            defineFunctions();
            this.y_range = y_bounds[0] + "," + y_bounds[1];
            this.update();
        },
        update() { //main entry

            try {


              if (loops >= limit) {
                loops = 0;
                frame();
            }
        
            loops = 0;


                let yp = this.y_range.split(",");
                let y_bounds_t = [math.evaluate(yp[0]), math.evaluate(yp[1])].map(Number);
                let x = this.x_range.split(",");
                x_bounds = [math.evaluate(x[0]), math.evaluate(x[1])].map(Number);

                if (y_bounds_t[0] == y_bounds[0] && y_bounds_t[1] == y_bounds[1]) { //if y_bounds are the same replace to match x pixel scale
                    y_bounds = null;
                    defineFunctions();
                    this.y_range = y_bounds[0] + "," + y_bounds[1];
                }

                x_prime_str = this.x_prime;
                y_prime_str = this.y_prime;
                particle = [0.1, 0.1];

                let y = this.y_range.split(",");
                y_bounds = [math.evaluate(y[0]), math.evaluate(y[1])].map(Number);

                let p = this.p_range.split(",");
                particle = [math.evaluate(p[0]), math.evaluate(p[1])].map(Number);

                clear();
                runtime();
                renderer.render(stage);


            } catch (e) {
                console.error(e);
                alert("Failed To Plot: \n" + String(e)); //attempt to give a useful error
            }
        }
    },
    created() {
        runtime();
        renderer.render(stage);
        frame();
    },
    components: {
        Favorites
    }
}).$mount("#app");