use crate::{particle::Particle, rectangle::Rectangle};

#[derive(Clone)]
pub struct QuadTree {
    pub boundary: Rectangle,
    pub capacity: usize,
    pub particles: Vec<Particle>,
    pub is_divided: bool,
    pub northeast: Option<Box<QuadTree>>,
    pub northwest: Option<Box<QuadTree>>,
    pub southeast: Option<Box<QuadTree>>,
    pub southwest: Option<Box<QuadTree>>,
}

impl QuadTree {
    pub fn new(boundary: Rectangle, capacity: usize) -> QuadTree {
        QuadTree {
            boundary,
            capacity,
            particles: Vec::new(),
            is_divided: false,
            northeast: None,
            northwest: None,
            southeast: None,
            southwest: None,
        }
    }

    pub fn subdivide(&mut self) {
        let x = self.boundary.x;
        let y = self.boundary.y;
        let w = self.boundary.w / 2.0;
        let h = self.boundary.h / 2.0;

        let ne = Rectangle::new(x + w, y - h, w, h);
        let nw = Rectangle::new(x - w, y - h, w, h);
        let se = Rectangle::new(x + w, y + h, w, h);
        let sw = Rectangle::new(x - w, y + h, w, h);

        self.northeast = Some(Box::new(QuadTree::new(ne, self.capacity)));
        self.northwest = Some(Box::new(QuadTree::new(nw, self.capacity)));
        self.southeast = Some(Box::new(QuadTree::new(se, self.capacity)));
        self.southwest = Some(Box::new(QuadTree::new(sw, self.capacity)));

        self.is_divided = true;
    }

    pub fn insert(&mut self, particle: &Particle) -> bool {
        if !self.boundary.contains(particle) {
            return false;
        }

        if self.particles.len() < self.capacity {
            self.particles.push(*particle);
            return true;
        } else {
            if !self.is_divided {
                self.subdivide();
            }

            if self.northeast.as_mut().unwrap().insert(particle) {
                return true;
            }
            if self.northwest.as_mut().unwrap().insert(particle) {
                return true;
            }
            if self.southeast.as_mut().unwrap().insert(particle) {
                return true;
            }
            if self.southwest.as_mut().unwrap().insert(particle) {
                return true;
            }
        }

        false
    }

    pub fn query(&mut self, range: &mut Rectangle, found: &mut Vec<Particle>) {
        if !self.boundary.intersects(&range) {
            return;
        }

        for particle in &self.particles {
            if range.contains(&particle) {
                found.push(*particle);
            }
        }

        if self.is_divided {
            self.northeast.as_mut().unwrap().query(range, found);
            self.northwest.as_mut().unwrap().query(range, found);
            self.southeast.as_mut().unwrap().query(range, found);
            self.southwest.as_mut().unwrap().query(range, found);
        }
    }
}
