// これを書いてる時点だと、衝突判定はだいたいAIに書かせている。
import { Wall } from './wall';
import { Circle } from './circle';
import { Line } from './line';

type CollisionCircleIdToWallId = { [circleId: number]: number };
type CollisionCircleIdToCircleId = { [circleId: number]: number };
type CollisionCircleIdToLineId = { [circleId: number]: number };

const detectCollisions = (): [
  CollisionCircleIdToWallId,
  CollisionCircleIdToCircleId,
  CollisionCircleIdToLineId
] => {
  const collisionCircleIdToWallId: CollisionCircleIdToWallId = {};
  const collisionCircleIdToCircleId: CollisionCircleIdToCircleId = {};
  const collisionCircleIdToLineId: CollisionCircleIdToLineId = {};
  // 一度に複数のオブジェクトとは衝突しないようにする（わけがわからなくなるため）
  const collidedCircleIds = new Set<number>();
  const collidedLineIds = new Set<number>();

  for (const circle of Object.values(Circle.idToCircle)) {
    // これを書いてる時点では、このロジックは不要かもしれないが、後に順序を変えたときの安全策として。
    if (collidedCircleIds.has(circle.id)) {
      continue;
    }

    const dx = circle.positionX - Wall.wall.positionX;
    const dy = circle.positionY - Wall.wall.positionY;
    // TODO: hypot を使う
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const overlap = distance + circle.radius - Wall.wall.radius;

    if (overlap > 0) {
      collisionCircleIdToWallId[circle.id] = Wall.wall.id;
      collidedCircleIds.add(circle.id);
    }
  }

  const circleIds = Object.keys(Circle.idToCircle).map(id => parseInt(id, 10));
  for (let i = 0; i < circleIds.length; i++) {
    for (let j = i + 1; j < circleIds.length; j++) {
      if (collidedCircleIds.has(circleIds[i]) || collidedCircleIds.has(circleIds[j])) {
        continue;
      }
      const circleA = Circle.idToCircle[circleIds[i]];
      const circleB = Circle.idToCircle[circleIds[j]];

      const dx = circleB.positionX - circleA.positionX;
      const dy = circleB.positionY - circleA.positionY;
      const distance = Math.sqrt(dx ** 2 + dy ** 2);
      const overlap = circleA.radius + circleB.radius - distance;

      if (overlap > 0) {
        collisionCircleIdToCircleId[circleA.id] = circleB.id;
        collidedCircleIds.add(circleA.id);
        collidedCircleIds.add(circleB.id);
      }
    }
  }

  // circle と（他の circle の） line の衝突判定
  for (const circle of Object.values(Circle.idToCircle)) {
    for (const line of Object.values(Line.idToLine)) {
      if (line.circleId === circle.id) {
        continue;
      }
      if (collidedCircleIds.has(circle.id) || collidedLineIds.has(line.id)) {
        continue;
      }

      // origin circle: line を作成した円（line のもう一方の端点はこの円の中心である）
      const originCircle = Circle.idToCircle[line.circleId];
      // if (!originCircle) {
      //   continue; // 安全策: origin が無ければスキップ
      // }

      // line は (line.positionX, line.positionY), (originCircle.positionX, originCircle.positionY) の線分
      const lx1 = line.positionX;
      const ly1 = line.positionY;
      const lx2 = originCircle.positionX;
      const ly2 = originCircle.positionY;

      // line の単位ベクトル
      const ldx = lx2 - lx1;
      const ldy = ly2 - ly1;
      const lLength = Math.sqrt(ldx ** 2 + ldy ** 2);

      // 長さゼロの線分は衝突判定を行わない
      if (lLength === 0) {
        continue;
      }

      const lux = ldx / lLength;
      const luy = ldy / lLength;

      // line から circle 中心へのベクトル
      const cdx = circle.positionX - lx1;
      const cdy = circle.positionY - ly1;

      // 投影長
      const projectionLength = cdx * lux + cdy * luy;

      // 最近接点の座標
      let closestX: number;
      let closestY: number;
      if (projectionLength < 0) {
        closestX = lx1;
        closestY = ly1;
      } else if (projectionLength > lLength) {
        closestX = lx2;
        closestY = ly2;
      } else {
        closestX = lx1 + projectionLength * lux;
        closestY = ly1 + projectionLength * luy;
      }

      // 最近接点と circle 中心の距離
      const ddx = circle.positionX - closestX;
      const ddy = circle.positionY - closestY;
      const distance = Math.sqrt(ddx ** 2 + ddy ** 2);
      const overlap = circle.radius - distance;

      if (overlap > 0) {
        collisionCircleIdToLineId[circle.id] = line.id;
        collidedCircleIds.add(circle.id);
        collidedLineIds.add(line.id);
      }
    }
  }

  return [
    collisionCircleIdToWallId,
    collisionCircleIdToCircleId,
    collisionCircleIdToLineId
  ];
}

const collide = (
  collisionCircleIdToWallId: CollisionCircleIdToWallId,
  collisionCircleIdToCircleId: CollisionCircleIdToCircleId,
  collisionCircleIdToLineId: CollisionCircleIdToLineId
): void => {
  for (const circleIdStr of Object.keys(collisionCircleIdToWallId)) {
    const circleId = parseInt(circleIdStr, 10);
    const circle = Circle.idToCircle[circleId];
    const dx = circle.positionX - Wall.wall.positionX;
    const dy = circle.positionY - Wall.wall.positionY;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const overlap = distance + circle.radius - Wall.wall.radius;

    // const exactDistance = Wall.wall.radius - circle.radius;

    // line の追加
    const distanceDivWallRadius = distance / Wall.wall.radius > 1 ? 1 : distance / Wall.wall.radius;
    Line.create(
      circle.id,
      Wall.wall.radius * Math.cos(circle.angle()),
      Wall.wall.radius * Math.sin(circle.angle())
    )
    Line.create(
      circle.id,
      Wall.wall.radius * Math.cos(circle.angle() + Math.acos(distanceDivWallRadius)),
      Wall.wall.radius * Math.sin(circle.angle() + Math.acos(distanceDivWallRadius))
    )
    Line.create(
      circle.id,
      Wall.wall.radius * Math.cos(circle.angle() - Math.acos(distanceDivWallRadius)),
      Wall.wall.radius * Math.sin(circle.angle() - Math.acos(distanceDivWallRadius))
    )

    // circle 方向単位ベクトルの計算
    const ux = dx / distance;
    const uy = dy / distance;

    // 位置の修正
    // TODO: あとで不要になる
    circle.positionX -= ux * overlap;
    circle.positionY -= uy * overlap;

    // 速度の反射
    const dotProduct = circle.positionXDot * ux + circle.positionYDot * uy;
    circle.positionXDot -= 2 * dotProduct * ux;
    circle.positionYDot -= 2 * dotProduct * uy;

    // 速度の追加
    circle.positionXDot *= 1.1;
    circle.positionYDot *= 1.1;
  }

  for (const circleIdStr of Object.keys(collisionCircleIdToCircleId)) {
    const circleId = parseInt(circleIdStr, 10);
    const circleA = Circle.idToCircle[circleId];
    const circleBId = collisionCircleIdToCircleId[circleId];
    const circleB = Circle.idToCircle[circleBId];

    const dx = circleB.positionX - circleA.positionX;
    const dy = circleB.positionY - circleA.positionY;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const overlap = circleA.radius + circleB.radius - distance;

    // 円同士の接触方向単位ベクトルの計算
    const ux = dx / distance;
    const uy = dy / distance;

    // 位置の修正
    circleA.positionX -= (ux * overlap) / 2;
    circleA.positionY -= (uy * overlap) / 2;
    circleB.positionX += (ux * overlap) / 2;
    circleB.positionY += (uy * overlap) / 2;

    // 速度の反射
    const dotProductA = circleA.positionXDot * ux + circleA.positionYDot * uy;
    const dotProductB = circleB.positionXDot * ux + circleB.positionYDot * uy;

    circleA.positionXDot -= 2 * dotProductA * ux;
    circleA.positionYDot -= 2 * dotProductA * uy;
    circleB.positionXDot -= 2 * dotProductB * ux;
    circleB.positionYDot -= 2 * dotProductB * uy;

    // 速度の追加
    circleA.positionXDot *= 1.1;
    circleA.positionYDot *= 1.1;
    circleB.positionXDot *= 1.1;
    circleB.positionYDot *= 1.1;
  }

  for (const circleIdStr of Object.keys(collisionCircleIdToLineId)) {
    const circleId = parseInt(circleIdStr, 10);
    const circle = Circle.idToCircle[circleId];
    const lineId = collisionCircleIdToLineId[circleId];
    const line = Line.idToLine[lineId];

    // 衝突したら line が消える
    delete Line.idToLine[line.id];
    // circle に対応する line が無くなった場合、 circle が消える
    // TODO: ここ非効率すぎるのでなんとかする
    const hasLine = Object.values(Line.idToLine).some(l => l.circleId === line.circleId);
    if (!hasLine) {
      delete Circle.idToCircle[line.circleId];
    }
  }
}

export { detectCollisions, collide };
