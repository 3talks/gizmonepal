export const STORE = {
  name: "PulseGear",
  tagline: "Gadget & Accessory Showroom",
  description:
    "A curated showroom of mobile accessories, chargers, power banks, audio, action camera and bike gear — browse in-store stock online.",
  phone: "+977 9800000000",
  whatsapp: "9779800000000",
  email: "hello@pulsegear.store",
  address: "Level 2, Tech Arcade, New Road, Kathmandu, Nepal",
  hours: "Sun – Fri: 10:00 – 19:30 · Sat: 11:00 – 17:00",
  mapEmbed:
    "https://www.google.com/maps?q=New+Road+Kathmandu+Nepal&output=embed",
} as const;

export const whatsappLink = (message = "Hi! I'd like to ask about a product.") =>
  `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
