import { ELEMENT_ERASE_THRESHOLD, CIRCLE_ERASE_THRESHOLD } from "../constants";

export const isPointNearCircle = (x1, y1, radius, pointX, pointY) => {
  // export const isPointNearCircle = (x1, y1, x2, y2, pointX, pointY) => {
  const dx = pointX - x1;
  const dy = pointY - y1;
  const distFromCenter = Math.sqrt(dx * dx + dy * dy);
  // return Math.abs(distFromCenter - radius) < ELEMENT_ERASE_THRESHOLD;
  return Math.abs(distFromCenter - radius) < CIRCLE_ERASE_THRESHOLD;
  // return (
  //   Math.abs(Math.abs(x2 - x1) - Math.abs(pointX - x1)) <
  //     ELEMENT_ERASE_THRESHOLD &&
  //   Math.abs(Math.abs(y2 - y1) - Math.abs(pointY - y1)) <
  //     ELEMENT_ERASE_THRESHOLD
  // );
};

export const isPointNearLine = (x1, y1, x2, y2, pointX, pointY) => {
  const distToStart = distanceBetweenPoints(x1, y1, pointX, pointY);
  const distToEnd = distanceBetweenPoints(x2, y2, pointX, pointY);
  const distLine = distanceBetweenPoints(x1, y1, x2, y2);
  return Math.abs(distToStart + distToEnd - distLine) < ELEMENT_ERASE_THRESHOLD;
};

export const isNearPoint = (x, y, x1, y1) => {
  return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5;
};

export const getArrowHeadCoordinates = (x1, y1, x2, y2, arrowLength) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);

  const x3 = x2 - arrowLength * Math.cos(angle - Math.PI / 6);
  const y3 = y2 - arrowLength * Math.sin(angle - Math.PI / 6);

  const x4 = x2 - arrowLength * Math.cos(angle + Math.PI / 6);
  const y4 = y2 - arrowLength * Math.sin(angle + Math.PI / 6);

  return {
    x3,
    y3,
    x4,
    y4,
  };
};

export const midPointBtw = (p1, p2) => {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
};

const distanceBetweenPoints = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};
