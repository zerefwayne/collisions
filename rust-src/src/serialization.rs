use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParticleSerialized {
    pub x: f64,
    pub y: f64,
    pub dx: f64,
    pub dy: f64,
    pub radius: f64,
    pub color: String,
}

#[wasm_bindgen]
pub struct ParticlesSerialized {
    particles: Vec<ParticleSerialized>,
}

#[wasm_bindgen]
impl ParticlesSerialized {
    #[wasm_bindgen(constructor)]
    pub fn new(new_particles: JsValue) -> Result<ParticlesSerialized, JsValue> {
        let new_particles: Vec<ParticleSerialized> = from_value(new_particles)?;
        Ok(ParticlesSerialized {
            particles: new_particles,
        })
    }

    pub fn update(&mut self, canvas_width: f64, canvas_height: f64) -> Result<JsValue, JsValue> {
        for i in 0..self.particles.len() {
            let (first, rest) = self.particles.split_at_mut(i + 1);
            let particle = first.last_mut().unwrap();

            particle.x += particle.dx;
            particle.y += particle.dy;

            for other_particle in rest.iter_mut() {
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

                    let v1_final = (((m1 - m2) * v1.0 + 2.0 * m2 * v2.0) / (m1 + m2), v1.1);
                    let v2_final = (((m2 - m1) * v2.0 + 2.0 * m1 * v1.0) / (m1 + m2), v2.1);

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
            if particle.x + particle.radius > canvas_width || particle.x - particle.radius < 0.0 {
                particle.dx *= -1.0;
            }
            if particle.y + particle.radius > canvas_height || particle.y - particle.radius < 0.0 {
                particle.dy *= -1.0;
            }

            if particle.x + particle.radius > canvas_width {
                particle.x = canvas_width - particle.radius;
            }

            if particle.x - particle.radius < 0.0 {
                particle.x = particle.radius;
            }

            if particle.y + particle.radius > canvas_height {
                particle.y = canvas_height - particle.radius;
            }

            if particle.y - particle.radius < 0.0 {
                particle.y = particle.radius;
            }
        }

        to_value(&self.particles.clone()).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
