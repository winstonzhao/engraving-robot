import { Component, State } from "@stencil/core";

const toRad = (deg: number) => (deg * Math.PI) / 180;

const toDeg = (rad: number) => (180 * rad) / Math.PI;

@Component({
  tag: "app-home",
  styleUrl: "app-home.css",
  shadow: true
})
export class AppHome {
  canvasSize = 750;

  canvas: HTMLCanvasElement;

  @State()
  interval: number;

  a1: number;

  a2: number;

  t1: number;

  t2: number;

  xInput: HTMLInputElement;
  yInput: HTMLInputElement;

  vx: number;
  vy: number;

  vxInput: HTMLInputElement;
  vyInput: HTMLInputElement;

  onToggleStart() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      return;
    }

    const vx = Number(this.vxInput.value);
    const vy = Number(this.vyInput.value);

    if (vx === NaN || vy === NaN) {
      return;
    }

    this.vx = vx;
    this.vy = vy;

    this.interval = setInterval(() => {
      this.updateAngles();
      this.drawRobot();
    }, 1);
  }

  onSetPosition() {
    const x = Number(this.xInput.value);
    const y = Number(this.yInput.value);

    if (x === NaN || y === NaN) {
      return;
    }

    this.setAnglesFor(x, y);
  }

  setAnglesFor(x: number, y: number) {
    const b = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
    const t1 = Math.acos(b / (2 * this.a1)) + Math.atan(x / y);
    const t2 = toRad(180) + 2 * Math.asin(b / (2 * this.a1));
    this.t1 = toDeg(t1);
    this.t2 = toDeg(t2);

    console.log(this.t1);
    console.log(this.t2);

    this.drawRobot();
  }

  clearCanvas() {
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.rect(0, 0, this.canvasSize, this.canvasSize);
    ctx.fill();
  }

  updateAngles() {
    const t1 = toRad(this.t1);
    const t2 = toRad(this.t2);
    const denom =
      -this.a1 *
        this.a2 *
        (Math.sin(t1) * Math.cos(t1 + t2) + Math.cos(t1) * Math.sin(t1 + t2)) -
      2 * Math.pow(this.a2, 2) * Math.sin(t1 + t2) * Math.cos(t1 + t2);

    const t1y = (this.a2 * Math.sin(t1 + t2)) / denom;
    const t1x = (this.a2 * Math.cos(t1 + t2)) / denom;
    const t2y = (-this.a1 * Math.sin(t1) - this.a1 * Math.sin(t1 + t2)) / denom;
    const t2x = (-this.a1 * Math.cos(t1) - this.a1 * Math.cos(t1 + t2)) / denom;

    const dt1 = t1y * this.vy + t1x * this.vx;
    const dt2 = t2y * this.vy + t2x * this.vx;

    let divisor = 50;

    // if (Math.abs(toDeg(dt1)) > 1 || Math.abs(toDeg(dt2)) > 1) {
    //   divisor = Math.max(Math.abs(toDeg(dt1)), Math.abs(toDeg(dt2)));
    // }

    console.log(toDeg(dt1), toDeg(dt2), divisor);

    this.t1 += toDeg(dt1) / divisor;
    this.t2 += toDeg(dt2) / divisor;
  }

  drawRobot() {
    this.clearCanvas();

    let j1x = this.a1 * Math.cos(toRad(this.t1));
    let j1y = this.a1 * Math.sin(toRad(this.t1));

    let j2x =
      this.a1 * Math.cos(toRad(this.t1)) +
      this.a2 * Math.cos(toRad(this.t1) + toRad(this.t2));
    let j2y =
      this.a1 * Math.sin(toRad(this.t1)) +
      this.a2 * Math.sin(toRad(this.t1) + toRad(this.t2));

    j1x += (1 / 2) * this.canvasSize;
    j2x += (1 / 2) * this.canvasSize;
    j1y = (1 / 2) * this.canvasSize - j1y;
    j2y = (1 / 2) * this.canvasSize - j2y;

    const ctx = this.canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(this.canvasSize / 2, this.canvasSize / 2);
    ctx.lineTo(j1x, j1y);
    ctx.lineTo(j2x, j2y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(j1x, j1y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(j2x, j2y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(
      (1 / 2) * this.canvasSize,
      (1 / 2) * this.canvasSize,
      10,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = "red";
    ctx.fill();
  }

  componentDidLoad() {
    this.a1 = 150;
    this.a2 = 150;
    this.t1 = 45;
    this.t2 = 45;

    this.drawRobot();
  }

  render() {
    return (
      <div class="app-home">
        <h1>The Engraving Robot Simulator</h1>
        <div class="inputs">
          <input ref={ref => (this.xInput = ref)} placeholder="x" />
          <input ref={ref => (this.yInput = ref)} placeholder="y" />
          <button onClick={() => this.onSetPosition()}>Set</button>
        </div>
        <div class="inputs">
          <input ref={ref => (this.vxInput = ref)} placeholder="vx" />
          <input ref={ref => (this.vyInput = ref)} placeholder="vy" />
          <button onClick={() => this.onToggleStart()}>
            {this.interval ? "Stop" : "Start"}
          </button>
        </div>
        <canvas
          ref={ref => (this.canvas = ref)}
          width={this.canvasSize}
          height={this.canvasSize}
        />
      </div>
    );
  }
}
