import { CARD_COSTUMES } from "./cardCatalog.js";

// Regular gallery order and all ticket designs verified 2026-10-27. Display labels preserve older save namespaces.
// Sources: pikminwiki.com/Decor_Pikmin and pikminwiki.com/Special_Decor_Pikmin.
export const DECOR_LOCATIONS = [
  { location: "Restaurant", costumes: [
    { name: "Chef Hat (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Chef Hat", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Café", costumes: [
    { name: "Coffee Cup (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Coffee Cup", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Sweetshop", costumes: [
    { name: "Macaron", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Donut", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Movie Theater", costumes: [
    { name: "Popcorn Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Pharmacy", costumes: [
    { name: "Toothbrush (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Toothbrush", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Zoo", costumes: [
    { name: "Dandelion", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Forest", costumes: [
    { name: "Stag Beetle (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Acorn (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Stag Beetle", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Acorn", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Waterside", costumes: [
    { name: "Fishing Lure (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Fishing Lure", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Post Office", costumes: [
    { name: "Stamp", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Art Gallery", costumes: [
    { name: "Picture Frame", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Airport", costumes: [
    { name: "Toy Airplane", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Luggage Tag", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Station", costumes: [
    { name: "Ticket (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Paper Train", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Ticket", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Gold Ticket", colors: ["Red"] },
  ]},
  { location: "Beach", costumes: [
    { name: "Shell", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Burger Place", costumes: [
    { name: "Burger", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Corner Store", costumes: [
    { name: "Bottle Cap", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Supermarket", costumes: [
    { name: "Banana (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Mushroom", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Banana", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Bakery", costumes: [
    { name: "Baguette (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Baguette", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Pastry", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Hair Salon", costumes: [
    { name: "Scissors (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Scissors", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Clothes Store", costumes: [
    { name: "Hair Tie", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Park", costumes: [
    { name: "Clover (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Four-Leaf Clover (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Clover", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Four-Leaf Clover", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Library & Bookstore", costumes: [
    { name: "Tiny Book", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Roadside", costumes: [
    { name: "Coin (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Sticker (Green)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Sticker (Blue)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Sticker (Orange)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Coin", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Sushi Restaurant", costumes: [
    { name: "Sushi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Mountain", costumes: [
    { name: "Mountain Pin Badge", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Stadium", costumes: [
    { name: "Ball Keychain (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
    { name: "Ball Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Rainy Day", storageLocation: "Weather", costumes: [
    { name: "Rainy Day: Leaf Hat", color: "Blue", colors: ["Blue"], designs: ["1", "2", "3"] },
  ]},
  { location: "Snowy Day", storageLocation: "Weather", costumes: [
    { name: "Snowy Day: Snow", colors: ["Blue", "White", "Ice"] },
  ]},
  { location: "Theme Park", costumes: [
    { name: "Theme Park Ticket: Design 1", colors: ["Red", "Yellow", "Blue"] },
    { name: "Theme Park Ticket: Design 2", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Bus Stop", costumes: [
    { name: "Bus Papercraft", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Italian Restaurant", costumes: [
    { name: "Pizza", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Pasta", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Ramen Restaurant", costumes: [
    { name: "Ramen Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Bridge", costumes: [
    { name: "Bridge Pin Badge", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Hotel", costumes: [
    { name: "Hotel Amenities", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Makeup Store", costumes: [
    { name: "Makeup", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Shrine & Temple", storageLocation: "Fortune", costumes: [
    { name: "Daikichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Kichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Chukichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Shokichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Suekichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Appliances Store", costumes: [
    { name: "Battery", designs: ["1", "2", "3", "4", "5", "6"], color: "Yellow" },
    { name: "Fairy Lights", designs: ["1", "2"], color: "Yellow" },
  ]},
  { location: "Curry Restaurant", costumes: [
    { name: "Curry Bowl", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "DIY Store", costumes: [
    { name: "Tool", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "University & College", costumes: [
    { name: "College Crest Patch", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Mexican Restaurant", costumes: [
    { name: "Taco", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Laundromats & Dry Cleaners", costumes: [
    { name: "Laundry Item", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Korean Restaurant", costumes: [
    { name: "Kimchi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Stationery Store", costumes: [
    { name: "Stationery", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
];

export const DECOR_SPECIAL_CATEGORIES = [
  { location: "Super Mario Keychain", costumes: [
    { name: "Super Mario Keychain", colors: ["Red", "Yellow", "Blue", "Purple"] },
  ]},
  { location: "Lunar New Year Ornament", costumes: [
    { name: "Lunar New Year Ornament: Red", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Lunar New Year Ornament: Gold", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Chess Piece", costumes: [
    { name: "Chess Piece: White", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Chess Piece: Black", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Fingerboard", costumes: [
    { name: "Fingerboard", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Hanafuda Card", costumes: [
    ...CARD_COSTUMES["Hanafuda Card"],
  ]},
  { location: "Jack-o'-Lantern", costumes: [
    { name: "Jack-o'-Lantern", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Halloween Treat", costumes: [
    { name: "Halloween Treat", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Halloween Light", costumes: [
    { name: "Halloween Light", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Halloween: Stained Glass", costumes: [
    { name: "Halloween: Stained Glass", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "First Anniversary Snack", costumes: [
    { name: "First Anniversary Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Koppaite Space Suit", costumes: [
    { name: "Koppaite Space Suit", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Mitten", costumes: [
    { name: "Mitten", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "2023 Glasses", costumes: [
    { name: "2023 Glasses", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "2024 Glasses", costumes: [
    { name: "2024 Glasses", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Valentine Sticker", costumes: [
    { name: "Valentine Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Reverse Valentine's Day Sticker", costumes: [
    { name: "Reverse Valentine's Day Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Present Sticker (Gold)", costumes: [
    { name: "Present Sticker (Gold)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Easter Egg", costumes: [
    { name: "Easter Egg", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Bunny Egg", costumes: [
    { name: "Bunny Egg", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Sneaker Keychain", costumes: [
    { name: "Sneaker Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Pikmin 4 Spaceship", costumes: [
    { name: "Pikmin 4 Spaceship", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Pikmin 4 Toy", costumes: [
    { name: "Pikmin 4 Toy", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Mahjong Tile", costumes: [
    ...CARD_COSTUMES["Mahjong Tile"],
  ]},
  { location: "Ice Cream", costumes: [
    { name: "Ice Cream: Classic", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Ice Cream: 2024 Flavor", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Ice Cream: Extra Flavor", colors: ["Ice"] },
  ]},
  { location: "Puzzle", costumes: [
    { name: "Puzzle: 2021 Fall Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Puzzle: 2022 Summer Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Puzzle: 2023 Summer Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
    { name: "Puzzle: 2024 Fall Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Spring Sticker", costumes: [
    { name: "Spring Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Summer Sticker", costumes: [
    { name: "Summer Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Fall Sticker", costumes: [
    { name: "Fall Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Winter Sticker", costumes: [
    { name: "Winter Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Playing Card", costumes: [
    ...CARD_COSTUMES["Playing Card"],
  ]},
  { location: "Cheese", costumes: [
    { name: "Cheese", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Coral", costumes: [
    { name: "Coral", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Paint", costumes: [
    { name: "Paint", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Rosette", costumes: [
    { name: "Red Rosette", colors: ["Red"] },
    { name: "Yellow Rosette", colors: ["Yellow"] },
    { name: "Purple Rosette", colors: ["Purple"] },
  ]},
  { location: "3rd Anniversary Cupcake", costumes: [
    { name: "3rd Anniversary Cupcake", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Ball Ornament", costumes: [
    { name: "Ball Ornament", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Party Popper 2025", costumes: [
    { name: "Party Popper 2025", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Chocolate", costumes: [
    { name: "Chocolate", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Rio Carnival", costumes: [
    { name: "Rio Carnival", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Afternoon Tea", costumes: [
    { name: "Afternoon Tea", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Nintendo Consoles '80-'95", costumes: [
    { name: "Nintendo Consoles '80-'95", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Tiny Instrument: Brass Band", costumes: [
    { name: "Tiny Instrument: Brass Band", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Surfboard Keychain", costumes: [
    { name: "Surfboard Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "Shaved Ice", costumes: [
    { name: "Shaved Ice", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Mooncake", costumes: [
    { name: "Mooncake", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Photo Button Badge", costumes: [
    { name: "Photo Button Badge", colors: ["Red"] },
  ]},
  { location: "Calavera", costumes: [
    { name: "Calavera", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "4th Anniversary Flower Box", costumes: [
    { name: "4th Anniversary Flower Box", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "4th Anniversary Snack", costumes: [
    { name: "4th Anniversary Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock"] },
  ]},
  { location: "2025 Ornament", costumes: [
    { name: "2025 Ornament", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Pacifier", costumes: [
    { name: "Pacifier", colors: ["Red"] },
  ]},
  { location: "Osechi", costumes: [
    { name: "Osechi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "2026 Chocolate", costumes: [
    { name: "2026 Chocolate", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Color Powder", costumes: [
    { name: "Color Powder", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Klompen Keychain", costumes: [
    { name: "Klompen Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Game Pak", costumes: [
    { name: "Game Pak", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Flower Crown", costumes: [
    { name: "Flower Crown", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Tiny Instrument: Orchestra", costumes: [
    { name: "Tiny Instrument: Orchestra", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Balinese Carving", costumes: [
    { name: "Balinese Carving", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Wurst", costumes: [
    { name: "Wurst", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"] },
  ]},
  { location: "Golden Toy Airplane", costumes: [
    { name: "Golden Toy Airplane", colors: ["Yellow"] },
  ]},
];

// Representative emoji per location/category — placeholder until real costume art is added.
export const DECOR_ICONS = {
  // DECOR_LOCATIONS
  "Restaurant": "🍽️", "Café": "☕", "Sweetshop": "🍬", "Movie Theater": "🎬",
  "Pharmacy": "💊", "Zoo": "🦁", "Forest": "🌲", "Waterside": "🎣",
  "Post Office": "📮", "Art Gallery": "🖼️", "Airport": "✈️", "Station": "🚉",
  "Beach": "🏖️", "Burger Place": "🍔", "Corner Store": "🏪", "Supermarket": "🛒",
  "Bakery": "🥖", "Hair Salon": "💇", "Clothes Store": "👕", "Park": "🍀",
  "Library & Bookstore": "📚", "Sushi Restaurant": "🍣", "Mountain": "⛰️",
  "Stadium": "⚽", "Theme Park": "🎡", "Bus Stop": "🚌", "Italian Restaurant": "🍕",
  "Ramen Restaurant": "🍜", "Bridge": "🌉", "Hotel": "🏨", "Makeup Store": "💄",
  "Appliances Store": "🔋", "Curry Restaurant": "🍛", "DIY Store": "🔧",
  "University & College": "🎓", "Mexican Restaurant": "🌮",
  "Laundromats & Dry Cleaners": "🧺", "Korean Restaurant": "🥘",
  "Stationery Store": "✏️", "Roadside": "🛣️", "Weather": "🌦️", "Fortune": "🔮", "Rainy Day": "🌧️", "Snowy Day": "❄️", "Shrine & Temple": "🔮",
  // DECOR_SPECIAL_CATEGORIES
  "Super Mario Keychain": "🍄", "Lunar New Year Ornament": "🧧", "Chess Piece": "♟️",
  "Fingerboard": "🛹", "Hanafuda Card": "🎴", "Jack-o'-Lantern": "🎃",
  "Halloween Treat": "🍭", "Halloween Light": "🕯️", "Halloween: Stained Glass": "🪟", "First Anniversary Snack": "🎂",
  "Koppaite Space Suit": "👽", "Mitten": "🧤", "2023 Glasses": "👓",
  "2024 Glasses": "🕶️", "Valentine Sticker": "💝", "Reverse Valentine's Day Sticker": "💌",
  "Present Sticker (Gold)": "🎁", "Easter Egg": "🥚", "Bunny Egg": "🐰",
  "Sneaker Keychain": "👟", "Pikmin 4 Spaceship": "🚀", "Pikmin 4 Toy": "🧸",
  "Mahjong Tile": "🀄", "Ice Cream": "🍦", "Puzzle": "🧩", "Spring Sticker": "🌸",
  "Summer Sticker": "☀️", "Fall Sticker": "🍁", "Winter Sticker": "❄️",
  "Playing Card": "🃏", "Cheese": "🧀", "Coral": "🪸", "Paint": "🎨",
  "Rosette": "🎖️", "3rd Anniversary Cupcake": "🧁", "Ball Ornament": "🎄",
  "Party Popper 2025": "🎉", "Chocolate": "🍫", "Rio Carnival": "🎭",
  "Afternoon Tea": "🫖", "Nintendo Consoles '80-'95": "🎮",
  "Tiny Instrument: Brass Band": "🎺", "Surfboard Keychain": "🏄", "Shaved Ice": "🍧",
  "Mooncake": "🥮", "Photo Button Badge": "📷", "Calavera": "💀",
  "4th Anniversary Flower Box": "💐", "4th Anniversary Snack": "🍪", "2025 Ornament": "🎄",
  "Pacifier": "🍼", "Osechi": "🍱", "2026 Chocolate": "🍫", "Color Powder": "🌈",
  "Klompen Keychain": "👞", "Game Pak": "💾", "Flower Crown": "🌼",
  "Tiny Instrument: Orchestra": "🎻", "Balinese Carving": "🪵", "Wurst": "🌭", "Golden Toy Airplane": "🛩️",
};

export const PIKMIN_COLORS = ["Red", "Yellow", "Blue", "Purple", "White", "Winged", "Rock", "Ice"];
export const PIKMIN_COLOR_HEX = {
  Red: "#e0453c", Yellow: "#eec32a", Blue: "#4a90d9", Purple: "#9b59b6",
  White: "#c9ccd1", Rock: "#8a7863", Winged: "#f28fb0", Ice: "#7fd4e0",
};
export const PIKMIN_COLOR_ABBR = { Red: "R", Yellow: "Y", Blue: "B", Purple: "P", White: "W", Rock: "Rk", Winged: "Wg", Ice: "Ic" };
