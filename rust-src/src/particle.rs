use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Particle {
    pub x: f64,
    pub y: f64,
    pub dx: f64,
    pub dy: f64,
    pub radius: f64,
    pub color_r: f64,
    pub color_g: f64,
    pub color_b: f64,
}
