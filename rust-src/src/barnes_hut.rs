use wasm_bindgen::prelude::*;

use crate::{
    particle::Particle,
    quad_tree::QuadTree,
    rectangle::Rectangle,
    utils::{get_random_integer, update_particle_colors},
};

#[wasm_bindgen]
pub struct BarnesUniverse {
    pub width: f64,
    pub height: f64,
    particles: Vec<Particle>,
    pub coefficient_of_restitution: f64,
    pub is_wall_elastic: bool,
}

#[wasm_bindgen]
impl BarnesUniverse {
    #[wasm_bindgen(constructor)]
    pub fn new(width: f64, height: f64) -> BarnesUniverse {
        BarnesUniverse {
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
        let boundary = Rectangle::new(
            self.width / 2.0,
            self.height / 2.0,
            self.width / 2.0,
            self.height / 2.0,
        );

        let mut qtree = QuadTree::new(boundary, 4);

        for particle in self.particles.iter() {
            let _ = qtree.insert(particle);
        }

        for particle in self.particles.iter_mut() {
            particle.x += particle.dx;
            particle.y += particle.dy;

            let mut range = Rectangle::new(
                particle.x,
                particle.y,
                particle.radius * 2.0,
                particle.radius * 2.0,
            );

            let mut potential_collisions: Vec<Particle> = Vec::new();

            qtree.query(&mut range, &mut potential_collisions);

            for other_particle in potential_collisions.iter_mut() {
                let dx = particle.x - other_particle.x;
                let dy = particle.y - other_particle.y;
                let distance = (dx * dx + dy * dy).sqrt();

                if distance < particle.radius + other_particle.radius {
                    let angle = dy.atan2(dx);
                    let sin = angle.sin();
                    let cos = angle.cos();

                    let v1 = (
                        cos * particle.dx + sin * particle.dy,
                        cos * particle.dy - sin * particle.dx,
                    );
                    let v2 = (
                        cos * other_particle.dx + sin * other_particle.dy,
                        cos * other_particle.dy - sin * other_particle.dx,
                    );

                    let m1 = particle.radius;
                    let m2 = other_particle.radius;

                    let mut v1_final = (((m1 - m2) * v1.0 + 2.0 * m2 * v2.0) / (m1 + m2), v1.1);
                    let mut v2_final = (((m2 - m1) * v2.0 + 2.0 * m1 * v1.0) / (m1 + m2), v2.1);

                    v1_final = (v1_final.0 * self.coefficient_of_restitution, v1_final.1);
                    v2_final = (v2_final.0 * self.coefficient_of_restitution, v2_final.1);

                    particle.dx = cos * v1_final.0 - sin * v1_final.1;
                    particle.dy = cos * v1_final.1 + sin * v1_final.0;
                    other_particle.dx = cos * v2_final.0 - sin * v2_final.1;
                    other_particle.dy = cos * v2_final.1 + sin * v2_final.0;

                    let overlap = (particle.radius + other_particle.radius - distance) / 2.0;
                    particle.x += cos * overlap;
                    particle.y += sin * overlap;
                    other_particle.x -= cos * overlap;
                    other_particle.y -= sin * overlap;
                }
            }

            // Check for bouncing off edges
            if particle.x + particle.radius > self.width || particle.x - particle.radius < 0.0 {
                particle.dx *= -1.0;

                if !self.is_wall_elastic {
                    particle.dx *= self.coefficient_of_restitution;
                }
            }
            if particle.y + particle.radius > self.height || particle.y - particle.radius < 0.0 {
                particle.dy *= -1.0;

                if !self.is_wall_elastic {
                    particle.dy *= self.coefficient_of_restitution;
                }
            }

            if particle.x + particle.radius > self.width {
                particle.x = self.width - particle.radius;
            }

            if particle.x - particle.radius < 0.0 {
                particle.x = particle.radius;
            }

            if particle.y + particle.radius > self.height {
                particle.y = self.height - particle.radius;
            }

            if particle.y - particle.radius < 0.0 {
                particle.y = particle.radius;
            }
        }

        update_particle_colors(&mut self.particles);
    }
}
