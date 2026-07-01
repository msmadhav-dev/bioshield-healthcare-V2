export type AdvertisementThemeKey = "pink" | "green" | "purple" | "blue" | "orange";

export const SLOT_DEFAULT_THEMES: Record<number, AdvertisementThemeKey> = {
  1: "orange",
  2: "blue",
  3: "purple",
  4: "green",
  5: "pink",
};

// Radial, not linear — white pools in the CENTER of the card and the color
// only shows up framing the edges/corners. A linear (corner-to-corner)
// gradient puts solid white right up against one edge, which read as "white
// shade on the edge" — radial keeps white in the middle where the text and
// image actually sit, and colors the perimeter instead.
export const ADVERTISEMENT_THEME_OPTIONS: Record<
  AdvertisementThemeKey,
  { label: string; background: string; styleImage: string }
> = {
  orange: { label: "Orange", background: "radial-gradient(circle at center, #FFFFFF 0%, #FFE9D2 100%)", styleImage: "/blobs/orange_style.png" },
  blue:   { label: "Blue",   background: "radial-gradient(circle at center, #FFFFFF 0%, #DCF1FC 100%)", styleImage: "/blobs/blue_style.png" },
  purple: { label: "Purple", background: "radial-gradient(circle at center, #FFFFFF 0%, #EDE3FA 100%)", styleImage: "/blobs/purple_style.png" },
  green:  { label: "Green",  background: "radial-gradient(circle at center, #FFFFFF 0%, #DBF5E5 100%)", styleImage: "/blobs/green_style.png" },
  pink:   { label: "Pink",   background: "radial-gradient(circle at center, #FFFFFF 0%, #FCE3EE 100%)", styleImage: "/blobs/pink_style.png" },
};

export const ADVERTISEMENT_THEME_KEYS = Object.keys(
  ADVERTISEMENT_THEME_OPTIONS
) as AdvertisementThemeKey[];