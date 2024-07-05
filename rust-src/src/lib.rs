use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

pub mod particle;
pub mod quad_tree;
pub mod rectangle;

pub mod utils;

pub mod barnes_hut;
pub mod serialization;
pub mod shared_memory;
