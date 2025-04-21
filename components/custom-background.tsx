"use client"

import type { BackgroundSettings } from "./background-customizer"
import { ParticlesBackground } from "./particles-background"

interface CustomBackgroundProps {
  settings: BackgroundSettings
}

export function CustomBackground({ settings }: CustomBackgroundProps) {
  const renderBackground = () => {
    switch (settings.type) {
      case "color":
        return <div className="absolute inset-0 z-0" style={{ backgroundColor: settings.color }} />
      case "gradient":
        return (
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(${settings.gradient.direction}, ${settings.gradient.from}, ${settings.gradient.to})`,
            }}
          />
        )
      case "image":
        return (
          <div className="absolute inset-0 z-0">
            <img
              src={settings.image.url || "/placeholder.svg"}
              alt="Background"
              className="w-full h-full object-cover"
            />
            {settings.image.overlay && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: settings.image.overlayColor,
                  opacity: settings.image.overlayOpacity,
                }}
              />
            )}
          </div>
        )
      case "particles":
        return (
          <div className="absolute inset-0 z-0" style={{ backgroundColor: "#f9fafb" }}>
            <ParticlesBackground
              colorMode={settings.particles.colorMode}
              color={settings.particles.color}
              colorSecondary={settings.particles.colorSecondary}
              colorCycleSpeed={settings.particles.colorCycleSpeed}
              number={settings.particles.number}
              speed={settings.particles.speed}
              connected={settings.particles.connected}
              repulseDistance={settings.particles.repulseDistance}
            />
          </div>
        )
      default:
        return null
    }
  }

  return renderBackground()
}
