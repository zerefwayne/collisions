use wasm_bindgen::prelude::*;

// Function that adds two numbers
#[wasm_bindgen]
pub fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}
