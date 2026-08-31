/* ------------------------------------------------------------------ */
/* Single source of truth for catalog data.                           */
/* Swap this for a real API call later — Home.jsx and ListingDetail.jsx*/
/* both read from here, so nothing else needs to change shape-wise.   */
/* ------------------------------------------------------------------ */
import fish1 from "../assets/iamge.jpg";

export const fishData = [
  {
    id: 1,
    img: fish1,
    name: "Crimson Betta",
    species: "Betta splendens",
    farm: "Coral Bay Hatchery",
    price: 18.5,
    stock: "In stock",
    color: "#E23E57",
    description:
      "A line-bred betta prized for its deep crimson finnage. Ships solo in a breathable, cushioned bag to minimize stress.",
    specs: { tank: "5+ gal (solo)", temp: "76–82°F", ph: "6.5–7.5", diet: "Carnivore — pellets & live food", temperament: "Territorial, solo only", size: "3 in", lifespan: "2–4 years" },
  },
  {
    id: 2,
    img: fish1,
    name: "Neon Tetra Shoal",
    species: "Paracheirodon innesi",
    farm: "Tidewater Farms",
    price: 6.25,
    stock: "In stock",
    color: "#2FB6C4",
    description:
      "Pond-raised in large outdoor systems for hardier stock. Sold per fish — best kept in shoals of six or more.",
    specs: { tank: "10+ gal, shoal of 6+", temp: "72–78°F", ph: "6.0–7.0", diet: "Omnivore — flakes & micro pellets", temperament: "Peaceful, schooling", size: "1.5 in", lifespan: "5+ years" },
  },
  {
    id: 3,
    img: fish1,
    name: "Blue Discus",
    species: "Symphysodon aequifasciatus",
    farm: "Blue Horizon Aquafarm",
    price: 42.0,
    stock: "Low stock",
    color: "#F2A65A",
    description:
      "Farm-raised through a selective breeding program for color and body shape. A centerpiece fish for a mature, cycled tank.",
    specs: { tank: "55+ gal", temp: "82–86°F", ph: "6.0–6.8", diet: "Omnivore — high-protein", temperament: "Calm, social", size: "8 in", lifespan: "10–15 years" },
  },
  {
    id: 4,
    img: fish1,
    name: "Koi Butterfly",
    species: "Cyprinus rubrofuscus",
    farm: "Lagoon Breeders Co.",
    price: 65.0,
    stock: "In stock",
    color: "#F4B860",
    description:
      "Pond-raised with championship bloodlines and elongated finnage. Ships in an insulated pond-transport box.",
    specs: { tank: "Pond, 500+ gal", temp: "59–77°F", ph: "7.0–8.0", diet: "Omnivore — pellets", temperament: "Peaceful, social", size: "24+ in", lifespan: "25+ years" },
  },
  {
    id: 5,
    img: fish1,
    name: "Ocellaris Clownfish",
    species: "Amphiprion ocellaris",
    farm: "Reeftrail Aquaculture",
    price: 24.5,
    stock: "Sold out",
    color: "#FF6B4A",
    description:
      "Captive-bred and reef-safe, reducing pressure on wild reef populations. Pairs well with anemones or on its own.",
    specs: { tank: "20+ gal (marine)", temp: "75–82°F", ph: "8.0–8.4", diet: "Omnivore — marine pellets", temperament: "Peaceful, pairs well", size: "3.3 in", lifespan: "6–10 years" },
  },
  {
    id: 6,
    img: fish1,
    name: "Silver Angelfish",
    species: "Pterophyllum scalare",
    farm: "Mistvale Fisheries",
    price: 12.0,
    stock: "In stock",
    color: "#8E7DBE",
    description:
      "A classic community centerpiece with tall, graceful finnage. Best introduced to a tank as a young pair or group.",
    specs: { tank: "30+ gal", temp: "76–84°F", ph: "6.8–7.8", diet: "Omnivore", temperament: "Semi-aggressive", size: "6 in", lifespan: "~10 years" },
  },
  {
    id: 7,
    img: fish1,
    name: "Endler Guppy Pair",
    species: "Poecilia wingei",
    farm: "Sunspire Hatchery",
    price: 4.75,
    stock: "In stock",
    color: "#5FA8D3",
    description:
      "A male-female pair of high-color Endler's livebearers. Prolific breeders — great for a beginner-friendly colony tank.",
    specs: { tank: "10+ gal", temp: "72–79°F", ph: "7.0–8.0", diet: "Omnivore", temperament: "Peaceful, prolific breeder", size: "1.4 in", lifespan: "~2 years" },
  },
  {
    id: 8,
    img: fish1,
    name: "Tiger Oscar",
    species: "Astronotus ocellatus",
    farm: "Northshoal Farms",
    price: 38.0,
    stock: "Low stock",
    color: "#B5651D",
    description:
      "An intelligent, personable cichlid that can recognize its keeper. Needs room to grow and a sturdy tank setup.",
    specs: { tank: "75+ gal", temp: "74–81°F", ph: "6.0–8.0", diet: "Carnivore", temperament: "Semi-aggressive, intelligent", size: "12 in", lifespan: "10–20 years" },
  },
];

export const farmDetails = {
  "Coral Bay Hatchery": { location: "Coral Bay, Gulf Coast", since: "2019", certs: ["Disease-free tested", "Line-bred for color"], blurb: "A small-batch betta breeder specializing in line-bred colors and show-quality finnage." },
  "Tidewater Farms": { location: "Tidewater Delta", since: "2021", certs: ["Sustainably farmed", "Bulk shoal specialist"], blurb: "Raises schooling fish in large outdoor pond systems for hardier, well-adjusted stock." },
  "Blue Horizon Aquafarm": { location: "Blue Horizon Valley", since: "2018", certs: ["Disease-free tested", "Selective breeding program"], blurb: "Discus specialists running a multi-generation selective breeding program for color and shape." },
  "Lagoon Breeders Co.": { location: "Lagoon Hills", since: "2017", certs: ["Championship bloodlines", "Pond-raised"], blurb: "A koi farm carrying championship bloodlines, raised in open ponds for size and vigor." },
  "Reeftrail Aquaculture": { location: "Reeftrail Coast", since: "2020", certs: ["Captive-bred, reef-safe", "Disease-free tested"], blurb: "Captive-breeds marine species to reduce pressure on wild reef populations." },
  "Mistvale Fisheries": { location: "Mistvale Basin", since: "2019", certs: ["Disease-free tested"], blurb: "A freshwater generalist farm known for consistent, healthy community fish." },
  "Sunspire Hatchery": { location: "Sunspire Flats", since: "2022", certs: ["High-volume breeder", "Sustainably farmed"], blurb: "High-volume livebearer specialists with fast, sustainable breeding cycles." },
  "Northshoal Farms": { location: "Northshoal Bay", since: "2016", certs: ["Disease-free tested", "Cichlid specialist"], blurb: "A cichlid-focused farm raising large, personable fish for experienced keepers." },
};
