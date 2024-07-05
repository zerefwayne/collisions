use crate::particle::Particle;

#[derive(Clone)]
pub struct Rectangle {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

impl Rectangle {
    pub fn new(x: f64, y: f64, w: f64, h: f64) -> Rectangle {
        Rectangle { x, y, w, h }
    }

    pub fn contains(&mut self, particle: &Particle) -> bool {
        particle.x - particle.radius > self.x - self.w
            && particle.x + particle.radius < self.x + self.w
            && particle.y - particle.radius > self.y - self.h
            && particle.y + particle.radius < self.y + self.h
    }

    pub fn intersects(&mut self, range: &Rectangle) -> bool {
        !(range.x - range.w > self.x + self.w
            || range.x + range.w < self.x - self.w
            || range.y - range.h > self.y + self.h
            || range.y + range.h < self.y - self.h)
    }
}
