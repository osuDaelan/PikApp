import { DECOR_LOCATIONS, DECOR_ICONS } from "../decor/catalog.js";

// OSM tag hypotheses, separate from collected Pikmin IDs. Alternatives are OR;
// predicates within one object are AND. These predict categories, not game drops.
const definitions = [
  ["restaurant", "Restaurant", [{ amenity: "restaurant" }]],
  ["cafe", "Café", [{ amenity: "cafe" }, { cuisine: "coffee_shop" }]],
  ["sweetshop", "Sweetshop", [{ shop: "confectionery" }, { shop: "pastry" }]],
  ["cinema", "Movie Theater", [{ amenity: "cinema" }]],
  ["pharmacy", "Pharmacy", [{ amenity: "pharmacy" }]],
  ["zoo", "Zoo", [{ tourism: "zoo" }]],
  ["forest", "Forest", [{ landuse: "forest" }, { natural: "wood" }]],
  ["waterside", "Waterside", [{ natural: "water" }]],
  ["post-office", "Post Office", [{ amenity: "post_office" }]],
  ["art-gallery", "Art Gallery", [{ tourism: "gallery" }, { tourism: "museum" }, { shop: "art" }]],
  ["airport", "Airport", [{ aeroway: "aerodrome" }, { aeroway: "heliport" }]],
  ["station", "Station", [{ railway: "station" }, { building: "train_station" }]],
  ["beach", "Beach", [{ natural: "beach" }]],
  ["burger", "Burger Place", [{ cuisine: "burger" }]],
  ["convenience", "Corner Store", [{ shop: "convenience" }]],
  ["supermarket", "Supermarket", [{ shop: "supermarket" }]],
  ["bakery", "Bakery", [{ shop: "bakery" }, { cuisine: "pretzel" }]],
  ["hair-salon", "Hair Salon", [{ shop: "hairdresser" }]],
  ["clothes", "Clothes Store", [{ shop: "clothes" }, { shop: "shoes" }]],
  ["park", "Park", [{ leisure: "park" }]],
  ["library", "Library & Bookstore", [{ amenity: "library" }, { shop: "books" }]],
  ["sushi", "Sushi Restaurant", [{ cuisine: "sushi" }]],
  ["mountain", "Mountain", [{ natural: "peak" }]],
  ["stadium", "Stadium", [{ leisure: "stadium" }]],
  ["theme-park", "Theme Park", [{ tourism: "theme_park" }]],
  ["bus-stop", "Bus Stop", [{ highway: "bus_stop" }]],
  ["italian", "Italian Restaurant", [{ cuisine: "italian" }, { cuisine: "pasta" }, { cuisine: "pizza" }]],
  ["ramen", "Ramen Restaurant", [{ cuisine: "ramen" }, { cuisine: "noodle" }, { cuisine: "soba" }, { cuisine: "udon" }, { cuisine: "chinese" }]],
  ["bridge", "Bridge", [{ bridge: "yes" }, { bridge: "viaduct" }]],
  ["hotel", "Hotel", [{ tourism: "hotel" }]],
  ["makeup", "Makeup Store", [{ shop: "cosmetics" }, { shop: "department_store" }, { amenity: "pharmacy" }]],
  ["appliances", "Appliances Store", [{ shop: "electronics" }, { shop: "computer" }, { shop: "appliance" }]],
  ["curry", "Curry Restaurant", [{ cuisine: "curry" }, { cuisine: "indian" }, { cuisine: "nepalese" }]],
  ["diy", "DIY Store", [{ shop: "doityourself" }, { shop: "hardware" }]],
  ["university", "University & College", [{ amenity: "university" }, { amenity: "college" }, { building: "university" }]],
  ["mexican", "Mexican Restaurant", [{ cuisine: "mexican" }, { cuisine: "tex-mex" }]],
  ["laundry", "Laundromats & Dry Cleaners", [{ shop: "laundry" }, { shop: "dry_cleaning" }]],
  ["korean", "Korean Restaurant", [{ cuisine: "korean" }]],
  ["stationery", "Stationery Store", [{ shop: "stationery" }, { shop: "books" }]],
];

export const MAP_CATEGORIES = definitions.map(([id, label, rules]) => {
  const group = DECOR_LOCATIONS.find(entry => entry.location === label);
  if (!group) throw new Error(`Map category has no checklist group: ${label}`);
  return { id, label, icon: DECOR_ICONS[label], rules, group };
});
export const CATEGORY_BY_ID = new Map(MAP_CATEGORIES.map(category => [category.id, category]));
export const DEFAULT_CATEGORY_IDS = ["restaurant", "cafe", "park", "waterside"];

export function cleanCategoryIds(ids) {
  return Array.isArray(ids) ? [...new Set(ids.filter(id => CATEGORY_BY_ID.has(id)))] : [];
}

export function matchCategories(tags = {}) {
  const tokens = key => typeof tags[key] === "string"
    ? tags[key].split(";").map(value => value.trim().toLowerCase()) : [];
  return MAP_CATEGORIES.filter(category => category.rules.some(rule =>
    Object.entries(rule).every(([key, value]) => tokens(key).includes(value))
  )).map(category => category.id);
}
