import { Component, State } from "@stencil/core";

// const toDeg = (rad: number) => (rad * 180) / Math.PI;

const toRad = (deg: number) => (deg * Math.PI) / 180;

@Component({
  tag: "app-home",
  styleUrl: "app-home.css",
  shadow: true
})
export class AppHome {
  canvasSize = 550;

  canvas: HTMLCanvasElement;

  @State()
  interval: number;

  a1: number;

  a2: number;

  @State()
  t1: number;

  @State()
  t2: number;

  xInput: HTMLInputElement;
  yInput: HTMLInputElement;

  vx: number;
  vy: number;

  vxInput: HTMLInputElement;
  vyInput: HTMLInputElement;

  x1: number;
  y1: number;

  @State()
  x2: number;
  @State()
  y2: number;

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
    let t2 =
      2 *
      Math.acos(
        (x < 0 ? -1 : 1) *
          Math.sqrt((Math.pow(x, 2), Math.pow(y, 2)) / Math.pow(this.a1, 2))
      );

    let t1 = (Math.atan((2 * y) / x) - t2) / 2;

    this.t1 = t1;
    this.t2 = t2;

    this.drawRobot();
  }

  clearCanvas() {
    const ctx = this.canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.rect(0, 0, this.canvasSize, this.canvasSize);
    ctx.fill();
  }

  updateAngles() {
    const t1 = this.t1;
    const t2 = this.t2;
    let denom =
      -this.a1 *
        this.a2 *
        (Math.sin(t1) * Math.cos(t1 + t2) + Math.cos(t1) * Math.sin(t1 + t2)) -
      2 * Math.pow(this.a2, 2) * Math.sin(t1 + t2) * Math.cos(t1 + t2);

    if (denom < 0) {
      denom *= -1;
    }

    const t1y = (this.a2 * Math.sin(t1 + t2)) / denom;
    const t1x = (this.a2 * Math.cos(t1 + t2)) / denom;
    const t2y = (-this.a1 * Math.sin(t1) - this.a1 * Math.sin(t1 + t2)) / denom;
    const t2x = (-this.a1 * Math.cos(t1) - this.a1 * Math.cos(t1 + t2)) / denom;

    const dt1 = t1y * this.vy + t1x * this.vx;
    const dt2 = t2y * this.vy + t2x * this.vx;

    const movement = 0.001;

    let divisor = Math.max(Math.abs(dt1), Math.abs(dt2)) / movement;

    this.t1 += dt1 / divisor;
    this.t2 += dt2 / divisor;

    this.t2 %= 2 * Math.PI;
    this.t1 %= 2 * Math.PI;
  }

  drawRobot() {
    this.clearCanvas();

    let j1x = this.a1 * Math.cos(this.t1);
    let j1y = this.a1 * Math.sin(this.t1);

    let j2x =
      this.a1 * Math.cos(this.t1) + this.a2 * Math.cos(this.t1 + this.t2);
    let j2y =
      this.a1 * Math.sin(this.t1) + this.a2 * Math.sin(this.t1 + this.t2);

    this.x1 = j1x;
    this.y1 = j1y;

    this.x2 = j2x;
    this.y2 = j2y;

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
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(j2x, j2y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.stroke();
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
    ctx.stroke();
  }

  componentDidLoad() {
    this.a1 = 100;
    this.a2 = 100;
    this.t1 = toRad(50);
    this.t2 = toRad(0);

    this.drawRobot();
  }

  render() {
    return (
      <div class="app-home">
        <h1>The Engraving Robot Simulator</h1>
        <div class="button-box">
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
        </div>
        <div />
        <div class="button-box">
          <div class="labels">
            <p>
              x: {this.x2 ? this.x2.toFixed(2) : "unset"} y:{" "}
              {this.y2 ? this.y2.toFixed(2) : "unset"}
            </p>
          </div>
          <div class="labels">
            <p>
              theta1: {this.t1 ? this.t1.toFixed(2) : "unset"} theta2:{" "}
              {this.t2 ? this.t2.toFixed(2) : "unset"}
            </p>
          </div>
        </div>

        <canvas
          class="canvas"
          ref={ref => (this.canvas = ref)}
          width={this.canvasSize}
          height={this.canvasSize}
        />
      </div>
    );
  }
}
