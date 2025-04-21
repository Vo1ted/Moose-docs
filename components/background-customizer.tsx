"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Paintbrush, ImageIcon, Palette, Sparkles, Check } from "lucide-react"

export type BackgroundType = "color" | "gradient" | "image" | "particles"
export type ParticlesColorMode = "single" | "cycling" | "rainbow"

export interface BackgroundSettings {
  type: BackgroundType
  color: string
  gradient: {
    from: string
    to: string
    direction: string
  }
  image: {
    url: string
    overlay: boolean
    overlayColor: string
    overlayOpacity: number
  }
  particles: {
    colorMode: ParticlesColorMode
    color: string
    colorSecondary: string
    colorCycleSpeed: number
    number: number
    speed: number
    connected: boolean
    repulseDistance: number
  }
}

const defaultBackgroundSettings: BackgroundSettings = {
  type: "color",
  color: "#f9fafb",
  gradient: {
    from: "#4f46e5",
    to: "#06b6d4",
    direction: "to bottom right",
  },
  image: {
    url: "/placeholder.svg?height=1080&width=1920",
    overlay: true,
    overlayColor: "#000000",
    overlayOpacity: 0.5,
  },
  particles: {
    colorMode: "single",
    color: "#4f46e5",
    colorSecondary: "#ef4444",
    colorCycleSpeed: 3,
    number: 50,
    speed: 3,
    connected: true,
    repulseDistance: 100,
  },
}

const presetImages = [
  "/placeholder.svg?height=1080&width=1920",
  "/placeholder.svg?height=1080&width=1920&text=Mountains",
  "/placeholder.svg?height=1080&width=1920&text=Ocean",
  "/placeholder.svg?height=1080&width=1920&text=Forest",
  "/placeholder.svg?height=1080&width=1920&text=City",
]

const gradientDirections = [
  "to right",
  "to left",
  "to bottom",
  "to top",
  "to bottom right",
  "to bottom left",
  "to top right",
  "to top left",
]

interface BackgroundCustomizerProps {
  onSettingsChange: (settings: BackgroundSettings) => void
  initialSettings?: BackgroundSettings
}

export function BackgroundCustomizer({ onSettingsChange, initialSettings }: BackgroundCustomizerProps) {
  const [settings, setSettings] = useState<BackgroundSettings>(initialSettings || defaultBackgroundSettings)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    onSettingsChange(settings)
  }, [settings, onSettingsChange])

  const updateSettings = (newSettings: Partial<BackgroundSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const updateGradient = (gradientSettings: Partial<typeof settings.gradient>) => {
    setSettings((prev) => ({
      ...prev,
      gradient: { ...prev.gradient, ...gradientSettings },
    }))
  }

  const updateImage = (imageSettings: Partial<typeof settings.image>) => {
    setSettings((prev) => ({
      ...prev,
      image: { ...prev.image, ...imageSettings },
    }))
  }

  const updateParticles = (particlesSettings: Partial<typeof settings.particles>) => {
    setSettings((prev) => ({
      ...prev,
      particles: { ...prev.particles, ...particlesSettings },
    }))
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 fixed bottom-6 right-6 z-50 bg-background shadow-lg"
          title="Customize Background"
        >
          <Paintbrush className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96" side="top" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Customize Background</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSettings(defaultBackgroundSettings)}>
                Reset
              </Button>
              <Button size="sm" onClick={() => setIsOpen(false)}>
                <Check className="h-4 w-4 mr-1" /> Apply
              </Button>
            </div>
          </div>

          <Tabs
            defaultValue={settings.type}
            onValueChange={(value) => updateSettings({ type: value as BackgroundType })}
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="color" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Color</span>
              </TabsTrigger>
              <TabsTrigger value="gradient" className="flex items-center gap-1">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Gradient</span>
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Image</span>
              </TabsTrigger>
              <TabsTrigger value="particles" className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Particles</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="color" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="bg-color">Background Color</Label>
                <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-md border" style={{ backgroundColor: settings.color }} />
                  <Input
                    id="bg-color"
                    type="color"
                    value={settings.color}
                    onChange={(e) => updateSettings({ color: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gradient" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="gradient-from">From Color</Label>
                <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-md border" style={{ backgroundColor: settings.gradient.from }} />
                  <Input
                    id="gradient-from"
                    type="color"
                    value={settings.gradient.from}
                    onChange={(e) => updateGradient({ from: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradient-to">To Color</Label>
                <div className="flex gap-2">
                  <div className="h-9 w-9 rounded-md border" style={{ backgroundColor: settings.gradient.to }} />
                  <Input
                    id="gradient-to"
                    type="color"
                    value={settings.gradient.to}
                    onChange={(e) => updateGradient({ to: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gradient-direction">Direction</Label>
                <select
                  id="gradient-direction"
                  value={settings.gradient.direction}
                  onChange={(e) => updateGradient({ direction: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {gradientDirections.map((direction) => (
                    <option key={direction} value={direction}>
                      {direction.replace("to ", "").replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div
                className="h-20 rounded-md border"
                style={{
                  background: `linear-gradient(${settings.gradient.direction}, ${settings.gradient.from}, ${settings.gradient.to})`,
                }}
              />
            </TabsContent>

            <TabsContent value="image" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  type="text"
                  value={settings.image.url}
                  onChange={(e) => updateImage({ url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {presetImages.map((url, index) => (
                  <button
                    key={index}
                    className={`h-16 rounded-md border overflow-hidden ${settings.image.url === url ? "ring-2 ring-primary" : ""}`}
                    onClick={() => updateImage({ url })}
                  >
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preset ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="image-overlay"
                  checked={settings.image.overlay}
                  onCheckedChange={(checked) => updateImage({ overlay: checked })}
                />
                <Label htmlFor="image-overlay">Add Color Overlay</Label>
              </div>

              {settings.image.overlay && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="overlay-color">Overlay Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-9 w-9 rounded-md border"
                        style={{ backgroundColor: settings.image.overlayColor }}
                      />
                      <Input
                        id="overlay-color"
                        type="color"
                        value={settings.image.overlayColor}
                        onChange={(e) => updateImage({ overlayColor: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="overlay-opacity">Opacity: {settings.image.overlayOpacity}</Label>
                    </div>
                    <Slider
                      id="overlay-opacity"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[settings.image.overlayOpacity]}
                      onValueChange={(value) => updateImage({ overlayOpacity: value[0] })}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="particles" className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="particles-color-mode">Color Mode</Label>
                <select
                  id="particles-color-mode"
                  value={settings.particles.colorMode}
                  onChange={(e) => updateParticles({ colorMode: e.target.value as ParticlesColorMode })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="single">Single Color</option>
                  <option value="cycling">Color Cycling</option>
                  <option value="rainbow">Rainbow</option>
                </select>
              </div>

              {settings.particles.colorMode === "single" && (
                <div className="space-y-2">
                  <Label htmlFor="particles-color">Particles Color</Label>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 rounded-md border" style={{ backgroundColor: settings.particles.color }} />
                    <Input
                      id="particles-color"
                      type="color"
                      value={settings.particles.color}
                      onChange={(e) => updateParticles({ color: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {settings.particles.colorMode === "cycling" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="particles-color-primary">Primary Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-9 w-9 rounded-md border"
                        style={{ backgroundColor: settings.particles.color }}
                      />
                      <Input
                        id="particles-color-primary"
                        type="color"
                        value={settings.particles.color}
                        onChange={(e) => updateParticles({ color: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="particles-color-secondary">Secondary Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-9 w-9 rounded-md border"
                        style={{ backgroundColor: settings.particles.colorSecondary }}
                      />
                      <Input
                        id="particles-color-secondary"
                        type="color"
                        value={settings.particles.colorSecondary}
                        onChange={(e) => updateParticles({ colorSecondary: e.target.value })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="particles-cycle-speed">
                        Color Cycle Speed: {settings.particles.colorCycleSpeed}
                      </Label>
                    </div>
                    <Slider
                      id="particles-cycle-speed"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.particles.colorCycleSpeed]}
                      onValueChange={(value) => updateParticles({ colorCycleSpeed: value[0] })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="particles-number">Number of Particles: {settings.particles.number}</Label>
                </div>
                <Slider
                  id="particles-number"
                  min={10}
                  max={200}
                  step={10}
                  value={[settings.particles.number]}
                  onValueChange={(value) => updateParticles({ number: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="particles-speed">Speed: {settings.particles.speed}</Label>
                </div>
                <Slider
                  id="particles-speed"
                  min={1}
                  max={10}
                  step={1}
                  value={[settings.particles.speed]}
                  onValueChange={(value) => updateParticles({ speed: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="particles-repulse">
                    Cursor Repulse Distance: {settings.particles.repulseDistance}px
                  </Label>
                </div>
                <Slider
                  id="particles-repulse"
                  min={20}
                  max={200}
                  step={10}
                  value={[settings.particles.repulseDistance]}
                  onValueChange={(value) => updateParticles({ repulseDistance: value[0] })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="particles-connected"
                  checked={settings.particles.connected}
                  onCheckedChange={(checked) => updateParticles({ connected: checked })}
                />
                <Label htmlFor="particles-connected">Connect Particles</Label>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
}
