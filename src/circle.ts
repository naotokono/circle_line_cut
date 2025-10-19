import { g } from './global';
import { Line } from './line';
import { Wall } from './wall';

class Circle {
  static currentId = 0;
  static idToCircle: { [key: number]: Circle } = {};

  id: number = 0;
  positionX: number = 0;
  positionY: number = 0;
  positionXDot: number = 0;
  positionYDot: number = 0;
  radius: number = 0;
  color: string = 'red';

  private constructor() {}

  static create(
    positionX: number,
    positionY: number,
    positionXDot: number,
    positionYDot: number,
    radius: number,
    color: string
  ): Circle {
    Circle.currentId += 1;

    const circle = new Circle();
    circle.id = Circle.currentId;
    circle.positionX = positionX;
    circle.positionY = positionY;
    circle.positionXDot = positionXDot;
    circle.positionYDot = positionYDot;
    circle.radius = radius;
    circle.color = color;
    Circle.idToCircle[Circle.currentId] = circle;

    // 過去側の接触点（※厳密には計算が間違っている）
    Line.create(
      circle.id,
      Wall.wall.radius * Math.cos(circle.angle()),
      Wall.wall.radius * Math.sin(circle.angle())
    );
    const exactDistance = Wall.wall.radius - circle.radius;
    Line.create(
      circle.id,
      Wall.wall.radius * Math.cos(circle.angle() + Math.acos(exactDistance / Wall.wall.radius)),
      Wall.wall.radius * Math.sin(circle.angle() + Math.acos(exactDistance / Wall.wall.radius))
    )
    Line.create(
      circle.id,
      Wall.wall.radius * Math.cos(circle.angle() - Math.acos(exactDistance / Wall.wall.radius)),
      Wall.wall.radius * Math.sin(circle.angle() - Math.acos(exactDistance / Wall.wall.radius))
    )

    return circle;
  }

  angle() {
    return Math.atan2(this.positionY, this.positionX);
  }

  translate(subStepDt?: number) {
    const dt = subStepDt ?? g.dt;
    const nextPositionX = this.positionX + this.positionXDot * dt;
    const nextPositionY = this.positionY + this.positionYDot * dt;

    this.positionX = nextPositionX;
    this.positionY = nextPositionY;
  }

  draw() {
    g.ctx.beginPath();
    g.ctx.fillStyle = this.color;
    g.ctx.moveTo(this.positionX.canvasScale, this.positionY.canvasScale);
    g.ctx.arc(this.positionX.canvasScale, this.positionY.canvasScale, this.radius.canvasScale, 0, Math.PI * 2);
    g.ctx.fill();
  }
}


export { Circle };
