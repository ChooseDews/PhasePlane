# 2D Phase Plane Plotter

This project uses [PixiJs](https://www.pixijs.com/) & [MathJs](https://mathjs.org/index.html) to graph the phase plane of any 2D system. A partical solution is also tracked and traced to the chart (see example output below)

### [Demo](https://choosedews.github.io/PhasePlane/)

## Fields

The fields are evaluated by [MathJs](https://mathjs.org/index.html) to produce either functions or real numbers. This allows you to use exepected operations within both the x' y' functions feilds and domain feilds. Although the domain must evaluate to a real number.

## Building

This project uses [Parcel](https://parceljs.org/) to compile which can be installed with `npm install -g parcel`.
To build and start a developer server use `npm start`.
To build for production `npm run build`

![Example Phase Plane of a Limit Cycle](/static/limit_cycle_ex.png)
![Example Phase Plane of a Vortex](/static/vortex_ex.png)

## Potential Issues

1. If the functions are particular large in magnitude a numerical traced solution will not show
