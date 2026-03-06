# 1990s Gaming Retrospective

A premium, nostalgic web experience celebrating the golden era of video games from the 1990s. Built with modern web technologies, this static site blends classic 8-bit/16-bit retro aesthetics with modern design principles like glassmorphism, CSS 3D parallax effects, and smooth animations.

## Features

- **Premium Retro UI:** A fusion of modern glassmorphism and vintage 1990s aesthetics, including frosted glass panels, custom typography (`Press Start 2P`), and animated neon text gradients.
- **Immersive Hero Section:** An interactive hero banner featuring a 3D perspective synthwave grid and mathematically rendered, floating "digital dust" particles.
- **Playable HTML5 Canvas Game:** An embedded side-scrolling mini-game ("Retro Runner") built entirely in Vanilla JS. Features custom jump physics, collision detection, scaling difficulty, and particle effect explosions.
- **Web Audio Engine:** Synthesized vintage chiptune sound effects for in-game actions and a global, cross-page background chiptune arpeggiator.
- **Hall of Fame:** A responsive CSS grid displaying a curated roster of 12 iconic 1990s games (e.g., _Super Mario World_, _Doom_, _Final Fantasy VII_). Features 3D lift hover states and smooth scroll-triggered fade-in animations.

## Technologies Used

- **HTML5:** Semantic structure and the `<canvas>` element for the mini-game.
- **CSS3:** Advanced usage of CSS variables, Grid/Flexbox layouts, pseudo-elements (`::before`/`::after`) for CRT scanline and glare effects, and keyframe animations.
- **Vanilla JavaScript:** ES6 Modules for game logic, data handling, and DOM manipulation utilizing newer APIs like `IntersectionObserver` and the `Web Audio API`.
- **Zero Dependencies:** The site does not rely on heavy frameworks (React, Vue) or libraries (jQuery), resulting in blazing fast load times.

## How to Run Locally

Since this is a static site, you can run it using any simple local web server. 

### Prerequisites
- Python 3.x (or Node.js)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/robert-laws/google-game-retrospective.git
   ```
2. Navigate to the project directory:
   ```bash
   cd google-game-retrospective
   ```
3. Start a local server (using Python):
   ```bash
   python3 -m http.server 8080
   ```
4. Open your web browser and navigate to `http://localhost:8080`

## Deployment

This site is optimized for static hosting and can be directly deployed to GitHub Pages, Vercel, or Netlify without any build steps.

## License

This project is for educational and portfolio demonstration purposes. Game titles and descriptions are the property of their respective copyright holders.
