export class Rectangle {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  contains(circle) {
    return (
      circle.x - circle.radius > this.x - this.w &&
      circle.x + circle.radius < this.x + this.w &&
      circle.y - circle.radius > this.y - this.h &&
      circle.y + circle.radius < this.y + this.h
    );
  }

  intersects(range) {
    return !(
      range.x - range.w > this.x + this.w ||
      range.x + range.w < this.x - this.w ||
      range.y - range.h > this.y + this.h ||
      range.y + range.h < this.y - this.h
    );
  }
}
