# 🚀 Cosmic Voyage - 3D Developer Portfolio

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/ThreeJs-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
</div>

<br />

<div align="center">
  <h3><strong><a href="https://cosmic-portfolio-tusar.vercel.app/">🚀 View Live Project: Cosmic Voyage</a></strong></h3>
</div>

<br />

Welcome to **Cosmic Voyage**, a next-generation fully immersive 3D space-themed developer portfolio. Hop in your favorite spaceship or don your space suit and navigate through a procedurally generated solar system where each planet represents a different aspect of my professional experience, skills, and projects!

## ✨ Features

- 🌌 **Fully Immersive 3D Experience**: Built on top of Three.js and React Three Fiber to deliver high frame rates and visually stunning space scapes.
- 🚀 **Vehicle Selection**: Choose between a high-speed **Rocket** or an agile **Astronaut** to explore the galaxy.
- 🌍 **Interactive Planets**: Orbit around diverse planets, each acting as a unique section of the portfolio (About Me, Projects, Skills, Certificates, etc).
- 📱 **Fully Responsive**: The galaxy and UI beautifully adapt to Desktop, Tablet, and Mobile screens.
- ☄️ **Dynamic Animations**: Fluid camera movements, particle trails, and interactive hover effects powered by Framer Motion and Three.js.
- 🎨 **Modern UI Overlays**: Glassmorphism and sleek sci-fi interfaces built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **3D Rendering**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + custom CSS variables
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🏎️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You'll need Node.js installed on your machine.

- Node.js (v16.0.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TusarGoswami/cosmic-portfolio-voyage.git
   cd cosmic-portfolio-voyage
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Blast Off!** 🚀
   Open your browser and navigate to `http://localhost:5173` to explore the cosmos.

## 📁 Project Structure

Here is a quick overview of the key components inside the `src/` directory:

- `pages/Index.tsx`: The main entry point, handling the transition phases of the game (Loading, Start Screen, Vehicle Selection, Space).
- `components/GalaxyExploration.tsx`: The core 3D space scene containing the sun, orbit paths, and interactive planets.
- `components/ExitChoices.tsx` & `ExitModels.tsx`: The hangar scene for selecting your exploration vehicle.
- `components/LaunchTransition.tsx`: Hyperdrive animation that connects the vehicle selection to the open galaxy.
- `components/Planets/...`: Individual planet data logic, textures, and their specific HTML overlay content.
- `hooks/useParallax.ts`: Custom hook used for adding simple mouse-tracking parallax effects to UI components.

## 🤝 Contribution Guidelines

Found a bug or have an idea for a cool new planet or feature? Contributions are always welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">Made with ❤️ and ☕ by <strong>Tusar Goswami</strong>.</p>
