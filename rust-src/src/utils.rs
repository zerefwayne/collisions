use crate::particle::Particle;

use js_sys::Math;

pub fn update_particle_colors(particles: &mut Vec<Particle>) {
    for particle in particles.iter_mut() {
        let speed = calculate_speed(&particle);
        let color = get_color(speed); // Assuming max speed as 5.0
        particle.color_r = color[0];
        particle.color_g = color[1];
        particle.color_b = color[2];
    }
}

pub fn get_random_integer(min: i32, max: i32) -> f64 {
    let x = Math::random();
    let y = (max - min) as f64;
    (x * y) + (min as f64)
}

fn calculate_speed(particle: &Particle) -> f64 {
    (particle.dx.powi(2) + particle.dy.powi(2)).sqrt()
}

fn interpolate_color(value: f64, color1: [f64; 3], color2: [f64; 3]) -> [f64; 3] {
    let r = color1[0] + value * (color2[0] - color1[0]);
    let g = color1[1] + value * (color2[1] - color1[1]);
    let b = color1[2] + value * (color2[2] - color1[2]);
    [r, g, b]
}

fn get_color(speed: f64) -> [f64; 3] {
    let normalized_speed = speed / 5.0;
    let low_color: [f64; 3] = [0.0, 0.0, 139.0]; // Dark Blue
    let high_color: [f64; 3] = [255.0, 0.0, 0.0]; // Red
    interpolate_color(normalized_speed.min(1.0), low_color, high_color)
}
