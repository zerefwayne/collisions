use js_sys::Math;
use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Particle {
    pub x: f64,
    pub y: f64,
    pub dx: f64,
    pub dy: f64,
    pub radius: f64,
}

#[wasm_bindgen]
pub struct Universe {
    width: f64,
    height: f64,
    particles: Vec<Particle>,
}

#[wasm_bindgen]
impl Universe {
    #[wasm_bindgen(constructor)]
    pub fn new(width: f64, height: f64) -> Universe {
        Universe {
            width,
            height,
            particles: Vec::new(),
        }
    }

    #[wasm_bindgen]
    pub fn insert_particle(&mut self, x: f64, y: f64, radius: f64) {
        let dx = get_random_integer(-5, 5);
        let dy = get_random_integer(-5, 5);

        let particle = Particle {
            x,
            y,
            dy,
            dx,
            radius,
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

            self.insert_particle(x, y, radius)
        }
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

                    let v1_final = (((m1 - m2) * v1.0 + 2.0 * m2 * v2.0) / (m1 + m2), v1.1);
                    let v2_final = (((m2 - m1) * v2.0 + 2.0 * m1 * v1.0) / (m1 + m2), v2.1);

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
            }
            if circle.y + circle.radius > self.height || circle.y - circle.radius < 0.0 {
                circle.dy *= -1.0;
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
    }
}

fn get_random_integer(min: i32, max: i32) -> f64 {
    let x = Math::random();
    let y = (max - min) as f64;
    (x * y) + (min as f64)
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Circle {
    pub x: f64,
    pub y: f64,
    pub dx: f64,
    pub dy: f64,
    pub radius: f64,
    pub color: String,
}

#[wasm_bindgen]
pub struct Circles {
    circles: Vec<Circle>,
}

#[wasm_bindgen]
impl Circles {
    #[wasm_bindgen(constructor)]
    pub fn new(circles: JsValue) -> Result<Circles, JsValue> {
        let circles: Vec<Circle> = from_value(circles)?;
        Ok(Circles { circles })
    }

    pub fn update(&mut self, canvas_width: f64, canvas_height: f64) -> Result<JsValue, JsValue> {
        for i in 0..self.circles.len() {
            let (first, rest) = self.circles.split_at_mut(i + 1);
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

                    let v1_final = (((m1 - m2) * v1.0 + 2.0 * m2 * v2.0) / (m1 + m2), v1.1);
                    let v2_final = (((m2 - m1) * v2.0 + 2.0 * m1 * v1.0) / (m1 + m2), v2.1);

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
            if circle.x + circle.radius > canvas_width || circle.x - circle.radius < 0.0 {
                circle.dx *= -1.0;
            }
            if circle.y + circle.radius > canvas_height || circle.y - circle.radius < 0.0 {
                circle.dy *= -1.0;
            }

            if circle.x + circle.radius > canvas_width {
                circle.x = canvas_width - circle.radius;
            }

            if circle.x - circle.radius < 0.0 {
                circle.x = circle.radius;
            }

            if circle.y + circle.radius > canvas_height {
                circle.y = canvas_height - circle.radius;
            }

            if circle.y - circle.radius < 0.0 {
                circle.y = circle.radius;
            }
        }

        to_value(&self.circles.clone()).map_err(|e| JsValue::from_str(&e.to_string()))
    }
}
