export type Preset = {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
};

export const presets: Preset[] = [
  {
    id: "minimalist",
    title: "Minimalist",
    subtitle: "Clean · light wood · airy",
    prompt:
      "Restyle this space in a clean minimalist coffee-shop aesthetic: light wood, white walls, pendant lighting, uncluttered surfaces. Preserve the room's layout, dimensions, and camera angle exactly. Photorealistic.",
  },
  {
    id: "industrial",
    title: "Industrial",
    subtitle: "Concrete · steel · Edison",
    prompt:
      "Restyle this space in an industrial coffee-shop aesthetic: exposed concrete, steel fixtures, Edison bulb lighting, reclaimed wood. Preserve the room's layout, dimensions, and camera angle exactly. Photorealistic.",
  },
  {
    id: "warm-cafe",
    title: "Warm Café",
    subtitle: "Warm wood · soft lamps",
    prompt:
      "Restyle this space as a warm cozy café: warm-toned wood, soft lamps, plants, brass accents. Preserve the room's layout, dimensions, and camera angle exactly. Photorealistic.",
  },
  {
    id: "scandinavian",
    title: "Scandinavian",
    subtitle: "White oak · linen · daylight",
    prompt:
      "Restyle this space in a Scandinavian coffee-shop aesthetic: white oak, linen textiles, airy daylight, muted off-white palette, simple geometric furniture. Preserve the room's layout, dimensions, and camera angle exactly. Photorealistic.",
  },
  {
    id: "mid-century",
    title: "Mid-Century",
    subtitle: "Walnut · ochre · tapered legs",
    prompt:
      "Restyle this space in a mid-century modern coffee-shop aesthetic: walnut wood, ochre and teal accents, tapered furniture legs, globe pendant lighting. Preserve the room's layout, dimensions, and camera angle exactly. Photorealistic.",
  },
  {
    id: "japandi",
    title: "Japandi",
    subtitle: "Pale wood · paper lamps · stone",
    prompt:
      "Restyle this space in a Japandi coffee-shop aesthetic: pale wood, paper lanterns, low-profile furniture, clean minimalist lines, neutral earth tones, subtle greenery. Preserve the room's layout, dimensions, and camera angle exactly. Photorealistic.",
  },
];

export function getPreset(id: string): Preset | undefined {
  return presets.find((p) => p.id === id);
}
