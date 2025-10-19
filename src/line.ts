import { Circle } from './circle';
import { g } from './global';
import { Wall } from './wall';

class Line {
  static currentId = 0;
  static idToLine: { [key: number]: Line } = {};

  id: number = 0;
  circleId: number = 0;
  positionX: number = 0;
  positionY: number = 0;

  private constructor() {}

  static create(
    circleId: number,
    positionX: number,
    positionY: number
  ): Line {
    Line.currentId += 1;

    const line = new Line();
    line.id = Line.currentId;
    line.circleId = circleId;
    line.positionX = positionX;
    line.positionY = positionY;

    Line.idToLine[Line.currentId] = line;

    return line;
  }

  angle() {
    return Math.atan2(this.positionY, this.positionX);
  }

  translate() { }

  draw() {
    const circle = Circle.idToCircle[this.circleId];

    g.ctx.beginPath();
    g.ctx.strokeStyle = circle.color;
    g.ctx.lineWidth = 0.005.canvasScale;
    g.ctx.moveTo(circle.positionX.canvasScale, circle.positionY.canvasScale);
    g.ctx.lineTo((Wall.wall.radius * Math.cos(this.angle())).canvasScale, (Wall.wall.radius * Math.sin(this.angle())).canvasScale);
    g.ctx.stroke();
  }
}


export { Line };
