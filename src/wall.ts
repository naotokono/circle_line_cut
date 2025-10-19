import { g } from './global';

class Wall {
  static wall: Wall = null as unknown as Wall;

  id = 0;
  positionX = 0;
  positionY = 0;
  radius = 0;

  private constructor() {}

  // Wall にファクトリメソッドは不要だが、他に合わせている。
  static create(): Wall {
    const wall = new Wall();

    wall.id = 1;
    wall.positionX = 0;
    wall.positionY = 0;
    wall.radius = 0.8;

    Wall.wall = wall;

    return wall;
  }

  draw() {
    g.ctx.strokeStyle = 'white';
    g.ctx.lineWidth = 0.01.canvasScale;
    g.ctx.moveTo(0, 0);
    g.ctx.beginPath();
    g.ctx.arc(0, 0, 0.8.canvasScale, 0, Math.PI * 2);
    g.ctx.stroke();
  }
}

export { Wall };
