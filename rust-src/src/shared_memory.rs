use wasm_bindgen::prelude::*;

use crate::{
    particle::Particle,
    utils::{get_random_integer, update_particle_colors},
};

#[wasm_bindgen]
pub struct Universe {
    pub width: f64,
    pub height: f64,
    particles: Vec<Particle>,
    pub coefficient_of_restitution: f64,
    pub is_wall_elastic: bool,
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new(width: f64, height: f64) -> Universe {
        Universe {
            width,
            height,
            particles: Vec::new(),
            coefficient_of_restitution: 1.0,
            is_wall_elastic: true,
        }
    }

    #[wasm_bindgen]
    pub fn insert_particle(&mut self, x: f64, y: f64, dx: f64, dy: f64, radius: f64) {
        let particle = Particle {
            x,
            y,
            dy,
            dx,
            radius,
            color_r: 255.0,
            color_g: 255.0,
            color_b: 255.0,
        };

        self.particles.push(particle);
    }

    #[wasm_bindgen]
    pub fn generate_particles(&mut self, count: i32) {
        for _ in 0..count {
            let x = get_random_integer((self.width / 3.0) as i32, (2.0 * self.width / 3.0) as i32);
            let y =
                get_random_integer((self.height / 3.0) as i32, (2.0 * self.height / 3.0) as i32);
            let radius = get_random_integer(1, 3);

            let dx = get_random_integer(-1, 1);
            let dy = get_random_integer(-1, 1);

            self.insert_particle(x, y, dx, dy, radius)
        }
    }

    #[wasm_bindgen]
    pub fn decrease_particles(&mut self, count: i32) {
        if (count as usize) >= self.particles.len() {
            self.particles = vec![];
            return;
        }

        self.particles = self.particles.split_off(count as usize);
    }

    #[wasm_bindgen]
    pub fn generate_particle(&mut self, x: f64, y: f64) {
        let radius = get_random_integer(5, 10);
        let dx = get_random_integer(-20, 20);
        let dy = get_random_integer(-20, 20);

        self.insert_particle(x, y, dx, dy, radius)
    }

    #[wasm_bindgen]
    pub fn resize_universe(&mut self, width: f64, height: f64) {
        self.width = width;
        self.height = height;
    }

    #[wasm_bindgen]
    pub fn get_particles_ptr(&self) -> *const Particle {
        self.particles.as_ptr()
    }

    #[wasm_bindgen]
    pub fn get_particles_len(&self) -> usize {
        self.particles.len()
    }

    #[wasm_bindgen]
    pub fn set_coefficient_of_restitution(&mut self, new_coefficient: f64) {
        self.coefficient_of_restitution = new_coefficient;
    }

    #[wasm_bindgen]
    pub fn set_is_wall_elastic(&mut self, new_value: bool) {
        self.is_wall_elastic = new_value;
    }

    #[wasm_bindgen]
    pub fn tick(&mut self) {
        for i in 0..self.particles.len() {
            let (first, rest) = self.particles.split_at_mut(i + 1);
            let circle = first.last_mut().unwrap();

            circle.x += circle.dx;
            circle.y += circle.dy;

            for other_circle in rest.iter_mut() {
                let dx = circle.x - other_circle.x;
                let dy = circle.y - other_circle.y;
                let distance = (dx * dx + dy * dy).sqrt();

                if distance < circle.radius + other_circle.radius {
                    let angle = dy.atan2(dx);
                    let sin = angle.sin();
                    let cos = angle.cos();

                    let v1 = (
                        cos * circle.dx + sin * circle.dy,
                        cos * circle.dy - sin * circle.dx,
                    );
                    let v2 = (
                        cos * other_circle.dx + sin * other_circle.dy,
                        cos * other_circle.dy - sin * other_circle.dx,
                    );

                    let m1 = circle.radius;
                    let m2 = other_circle.radius;

                    let mut v1_final = (((m1 - m2) * v1.0 + 2.0 * m2 * v2.0) / (m1 + m2), v1.1);
                    let mut v2_final = (((m2 - m1) * v2.0 + 2.0 * m1 * v1.0) / (m1 + m2), v2.1);

                    v1_final = (v1_final.0 * self.coefficient_of_restitution, v1_final.1);
                    v2_final = (v2_final.0 * self.coefficient_of_restitution, v2_final.1);

                    circle.dx = cos * v1_final.0 - sin * v1_final.1;
                    circle.dy = cos * v1_final.1 + sin * v1_final.0;
                    other_circle.dx = cos * v2_final.0 - sin * v2_final.1;
                    other_circle.dy = cos * v2_final.1 + sin * v2_final.0;

                    let overlap = (circle.radius + other_circle.radius - distance) / 2.0;
                    circle.x += cos * overlap;
                    circle.y += sin * overlap;
                    other_circle.x -= cos * overlap;
                    other_circle.y -= sin * overlap;
                }
            }

            // Check for bouncing off edges
            if circle.x + circle.radius > self.width || circle.x - circle.radius < 0.0 {
                circle.dx *= -1.0;

                if !self.is_wall_elastic {
                    circle.dx *= self.coefficient_of_restitution;
                }
            }
            if circle.y + circle.radius > self.height || circle.y - circle.radius < 0.0 {
                circle.dy *= -1.0;

                if !self.is_wall_elastic {
                    circle.dy *= self.coefficient_of_restitution;
                }
            }

            if circle.x + circle.radius > self.width {
                circle.x = self.width - circle.radius;
            }

            if circle.x - circle.radius < 0.0 {
                circle.x = circle.radius;
            }

            if circle.y + circle.radius > self.height {
                circle.y = self.height - circle.radius;
            }

            if circle.y - circle.radius < 0.0 {
                circle.y = circle.radius;
            }
        }

        update_particle_colors(&mut self.particles);
    }
}
