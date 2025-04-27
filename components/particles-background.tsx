"use client"

import { useCallback, useEffect, useState } from "react"
import Particles from "react-tsparticles"
import { loadFull } from "tsparticles"
import type { Engine } from "tsparticles-engine"
import type { ParticlesColorMode } from "./background-customizer"

interface ParticlesBackgroundProps {
  colorMode: ParticlesColorMode
  color: string
  colorSecondary: string
  colorCycleSpeed: number
  number: number
  speed: number
  connected: boolean
  repulseDistance: number
}

// Rainbow colors array for the rainbow mode
const rainbowColors = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#8B00FF", // Violet
]

export function ParticlesBackground({
  colorMode,
  color,
  colorSecondary,
  colorCycleSpeed,
  number,
  speed,
  connected,
  repulseDistance,
}: ParticlesBackgroundProps) {
  const [currentColor, setCurrentColor] = useState(color)
  const [currentRainbowIndex, setCurrentRainbowIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  // For color cycling mode
  useEffect(() => {
    if (colorMode !== "cycling" && colorMode !== "rainbow") return

    let isCyclingToSecondary = false
    const interval = setInterval(
      () => {
        if (colorMode === "cycling") {
          isCyclingToSecondary = !isCyclingToSecondary
          setCurrentColor(isCyclingToSecondary ? colorSecondary : color)
        } else if (colorMode === "rainbow") {
          setCurrentRainbowIndex((prevIndex) => (prevIndex + 1) % rainbowColors.length)
        }
      },
      1000 / (colorCycleSpeed / 10),
    )

    return () => clearInterval(interval)
  }, [colorMode, color, colorSecondary, colorCycleSpeed])

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine)
    setLoaded(true)
  }, [])

  // Determine color value based on color mode
  const getColorValue = () => {
    switch (colorMode) {
      case "single":
        return color
      case "cycling":
        return currentColor
      case "rainbow":
        return rainbowColors[currentRainbowIndex]
      default:
        return color
    }
  }

  if (typeof window === "undefined") {
    return null // Don't render on server
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      className="absolute inset-0"
      options={{
        fullScreen: false,
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "repulse",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
            repulse: {
              distance: repulseDistance,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: getColorValue(),
          },
          links: {
            color: getColorValue(),
            distance: 150,
            enable: connected,
            opacity: 0.5,
            width: 1,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: speed,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: number,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
        detectRetina: true,
      }}
    />
  )
}
