"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, ChevronDown, Search } from "lucide-react"

// Popular Google Fonts
const popularFonts = [
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Roboto Condensed",
  "Source Sans Pro",
  "Oswald",
  "Raleway",
  "Nosifer",
  "Creepster",
  "Pacifico",
  "Dancing Script",
  "Shadows Into Light",
  "Lobster",
  "Indie Flower",
]

// Font categories
const fontCategories = {
  serif: ["Merriweather", "Playfair Display", "Lora", "Noto Serif", "PT Serif"],
  sansSerif: ["Roboto", "Open Sans", "Lato", "Montserrat", "Noto Sans"],
  display: ["Nosifer", "Creepster", "Lobster", "Pacifico", "Bangers"],
  handwriting: ["Dancing Script", "Shadows Into Light", "Indie Flower", "Caveat", "Satisfy"],
  monospace: ["Roboto Mono", "Source Code Pro", "PT Mono", "Ubuntu Mono", "Fira Mono"],
}

export interface FontSelectorProps {
  onFontChange: (font: string) => void
  currentFont: string
}

export function FontSelector({ onFontChange, currentFont }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [fontsLoaded, setFontsLoaded] = useState(false)
  const [allFonts, setAllFonts] = useState<string[]>([])

  // Load Google Fonts
  useEffect(() => {
    // Combine all fonts for the search functionality
    const combinedFonts = [
      ...popularFonts,
      ...fontCategories.serif,
      ...fontCategories.sansSerif,
      ...fontCategories.display,
      ...fontCategories.handwriting,
      ...fontCategories.monospace,
    ]

    // Remove duplicates
    setAllFonts([...new Set(combinedFonts)])

    // Create a link element for Google Fonts
    const link = document.createElement("link")
    link.rel = "stylesheet"

    // Prepare the fonts to be loaded
    const fontsToLoad = combinedFonts.map((font) => font.replace(/ /g, "+")).join("|")
    link.href = `https://fonts.googleapis.com/css2?family=${fontsToLoad}&display=swap`

    // Add the link to the document head
    document.head.appendChild(link)

    // Set fonts as loaded when the link is loaded
    link.onload = () => setFontsLoaded(true)

    return () => {
      // Clean up
      document.head.removeChild(link)
    }
  }, [])

  // Filter fonts based on search term
  const filteredFonts = searchTerm
    ? allFonts.filter((font) => font.toLowerCase().includes(searchTerm.toLowerCase()))
    : allFonts

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between" disabled={!fontsLoaded}>
          <span style={{ fontFamily: currentFont || "inherit" }}>{currentFont || "Select Font"}</span>
          <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 opacity-50" />
            <Input
              placeholder="Search fonts..."
              className="h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="popular">
          <div className="border-b">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="popular"
                className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
              >
                Popular
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
              >
                Categories
              </TabsTrigger>
              {searchTerm && (
                <TabsTrigger
                  value="search"
                  className="rounded-none border-b-2 border-b-transparent px-4 py-2 data-[state=active]:border-b-primary"
                >
                  Search
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="popular" className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {popularFonts.map((font) => (
                  <Button
                    key={font}
                    variant="ghost"
                    className="w-full justify-start font-normal"
                    style={{ fontFamily: font }}
                    onClick={() => {
                      onFontChange(font)
                      setIsOpen(false)
                    }}
                  >
                    <span className="truncate">{font}</span>
                    {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="categories" className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                <div className="mb-4">
                  <h3 className="mb-2 px-2 text-sm font-medium">Serif</h3>
                  {fontCategories.serif.map((font) => (
                    <Button
                      key={font}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      style={{ fontFamily: font }}
                      onClick={() => {
                        onFontChange(font)
                        setIsOpen(false)
                      }}
                    >
                      <span className="truncate">{font}</span>
                      {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 px-2 text-sm font-medium">Sans Serif</h3>
                  {fontCategories.sansSerif.map((font) => (
                    <Button
                      key={font}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      style={{ fontFamily: font }}
                      onClick={() => {
                        onFontChange(font)
                        setIsOpen(false)
                      }}
                    >
                      <span className="truncate">{font}</span>
                      {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 px-2 text-sm font-medium">Display</h3>
                  {fontCategories.display.map((font) => (
                    <Button
                      key={font}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      style={{ fontFamily: font }}
                      onClick={() => {
                        onFontChange(font)
                        setIsOpen(false)
                      }}
                    >
                      <span className="truncate">{font}</span>
                      {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 px-2 text-sm font-medium">Handwriting</h3>
                  {fontCategories.handwriting.map((font) => (
                    <Button
                      key={font}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      style={{ fontFamily: font }}
                      onClick={() => {
                        onFontChange(font)
                        setIsOpen(false)
                      }}
                    >
                      <span className="truncate">{font}</span>
                      {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </div>

                <div className="mb-4">
                  <h3 className="mb-2 px-2 text-sm font-medium">Monospace</h3>
                  {fontCategories.monospace.map((font) => (
                    <Button
                      key={font}
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      style={{ fontFamily: font }}
                      onClick={() => {
                        onFontChange(font)
                        setIsOpen(false)
                      }}
                    >
                      <span className="truncate">{font}</span>
                      {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {searchTerm && (
            <TabsContent value="search" className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="p-2">
                  {filteredFonts.length > 0 ? (
                    filteredFonts.map((font) => (
                      <Button
                        key={font}
                        variant="ghost"
                        className="w-full justify-start font-normal"
                        style={{ fontFamily: font }}
                        onClick={() => {
                          onFontChange(font)
                          setIsOpen(false)
                        }}
                      >
                        <span className="truncate">{font}</span>
                        {currentFont === font && <Check className="ml-auto h-4 w-4" />}
                      </Button>
                    ))
                  ) : (
                    <p className="px-2 py-4 text-center text-sm text-muted-foreground">No fonts found.</p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
