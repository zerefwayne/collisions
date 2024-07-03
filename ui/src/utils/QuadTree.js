import { Rectangle } from "./Rectangle";

export class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary; // Boundary is a rectangle { x, y, w, h }
    this.capacity = capacity; // Max number of objects in a quadrant before subdivision
    this.circles = [];
    this.divided = false;
  }

  subdivide() {
    let x = this.boundary.x;
    let y = this.boundary.y;
    let w = this.boundary.w / 2;
    let h = this.boundary.h / 2;

    let ne = new Rectangle(x + w, y - h, w, h);
    let nw = new Rectangle(x - w, y - h, w, h);
    let se = new Rectangle(x + w, y + h, w, h);
    let sw = new Rectangle(x - w, y + h, w, h);

    this.northeast = new QuadTree(ne, this.capacity);
    this.northwest = new QuadTree(nw, this.capacity);
    this.southeast = new QuadTree(se, this.capacity);
    this.southwest = new QuadTree(sw, this.capacity);

    this.divided = true;
  }

  insert(circle) {
    if (!this.boundary.contains(circle)) {
      return false;
    }

    if (this.circles.length < this.capacity) {
      this.circles.push(circle);
      return true;
    } else {
      if (!this.divided) {
        this.subdivide();
      }

      if (this.northeast.insert(circle)) return true;
      if (this.northwest.insert(circle)) return true;
      if (this.southeast.insert(circle)) return true;
      if (this.southwest.insert(circle)) return true;
    }
  }

  query(range, found) {
    if (!found) {
      found = [];
    }

    if (!this.boundary.intersects(range)) {
      return found;
    } else {
      for (let c of this.circles) {
        if (range.contains(c)) {
          found.push(c);
        }
      }
      if (this.divided) {
        this.northwest.query(range, found);
        this.northeast.query(range, found);
        this.southwest.query(range, found);
        this.southeast.query(range, found);
      }
    }

    return found;
  }
}
