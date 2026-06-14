# Modern Interactive Developer Portfolio

A high-performance, visually stunning developer portfolio website built using React, Vite, GSAP, and Three.js/React Three Fiber. 

---

## 🚀 Key Features

*   **Interactive 3D Under Construction Scene**: An immersive 3D scene built using React Three Fiber (R3F) featuring animated machinery (crane, concrete mixer, forklift, excavator), physical scaffolding, welding spark particles, and floating dust.
*   **Performance Optimization**: 
    *   Uses a custom `IntersectionObserver` wrapper to dynamically toggle the Three.js rendering `frameloop` (`always` vs `never`) based on viewport visibility.
    *   Pre-compiles shaders on mount to guarantee instant visibility upon scrolling without any lag.
*   **Adaptive Day/Night Theme**: Global CSS variables and React `ThemeContext` coordinate colors, styling, grid setups, and WebGL lighting settings (disabling shadows dynamically in night mode for high-contrast visibility and rendering efficiency).
*   **Fluid Motion & Animations**: Guided by **GSAP** & **ScrollTrigger** for state-of-the-art parallax transitions.
*   **Smooth Scrolling**: Powered by **Lenis** smooth scroll for consistent and buttery-smooth movement across desktop and mobile browsers.

---

## 🛠️ Technology Stack

*   **Core**: React 19, Vite (for blazing fast build times and HMR)
*   **3D Graphics**: Three.js, React Three Fiber (R3F), `@react-three/drei`
*   **Animation**: GSAP (GreenSock Animation Platform), ScrollTrigger
*   **Smooth Scroll**: Lenis Scroll
*   **Styling**: Modern Vanilla CSS with Tailwind CSS base hooks

---

## 📂 Project Structure

```text
├── public/                 # Static assets (3D textures, banners, icons)
├── src/
│   ├── assets/             # Project-specific images & media
│   ├── components/         # Modular React components
│   │   ├── UnderConstruction.jsx   # 3D Scene using R3F
│   │   ├── PreUI.jsx               # PreUI Section wrapping the 3D scene
│   │   ├── Hero.jsx                # Introduction & splash view
│   │   ├── About.jsx               # Biography & profile
│   │   ├── SkillStack.jsx          # Interactive skill matrix
│   │   ├── Works.jsx               # Project/Work cases scroll-animations
│   │   ├── Contact.jsx             # Form & communication deck
│   │   └── Navbar.jsx              # Navigation controls
│   ├── context/            # React context (ThemeContext for Day/Night toggle)
│   ├── App.jsx             # Main layout & Lenis initialization
│   ├── index.css           # Global typography, resets, design tokens
│   └── main.jsx            # Application mount point
├── package.json            # Configuration and script management
└── vite.config.js          # Vite configuration settings
```

---

## 💻 Getting Started

### Prerequisites

Make sure you have Node.js installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nagasaipreetham/Portfolio.git
   cd Portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build the application for production:
   ```bash
   npm run build
   ```

---

## ⚡ Highlights: 3D Render loop Optimizations

To deliver a premium experience without sacrificing performance or battery life, the application implements the following techniques:
- **DOM Persistence**: The 3D scene is kept mounted in the DOM to avoid repetitive WebGL context recreation (which causes 1-2s freezes).
- **Frameloop Toggle**: When the scene is out of view, the rendering is frozen instantly (`frameloop="never"`). It wakes up (`frameloop="always"`) instantly when entering the viewport.
- **Dynamic Shadow Mapping**: Activates shadow calculation (`shadows={isDay}`) during high-contrast daylight settings but turns off expensive shadow maps during night mode for optimal performance.

