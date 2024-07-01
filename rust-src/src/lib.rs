use serde::{Deserialize, Serialize};
use serde_wasm_bindgen::{from_value, to_value};
use wasm_bindgen::prelude::*;

// Function that adds two numbers
#[wasm_bindgen]
pub fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
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
