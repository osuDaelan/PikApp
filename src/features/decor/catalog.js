import { CARD_COSTUMES } from "./cardCatalog.js";

// Card designs expanded 2026-10-27. Older grouped card IDs remain readable for review.
// Sources: pikminwiki.com/Decor_Pikmin and pikminwiki.com/Special_Decor_Pikmin.
export const DECOR_LOCATIONS = [
  { location: "Restaurant", costumes: [
    { name: "Chef Hat", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Chef Hat (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Café", costumes: [
    { name: "Coffee Cup", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Coffee Cup (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Sweetshop", costumes: [
    { name: "Macaron", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Donut", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Movie Theater", costumes: [
    { name: "Popcorn Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Pharmacy", costumes: [
    { name: "Toothbrush", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Toothbrush (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Zoo", costumes: [
    { name: "Dandelion", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Forest", costumes: [
    { name: "Stag Beetle", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Acorn", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Stag Beetle (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Acorn (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Waterside", costumes: [
    { name: "Fishing Lure", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Fishing Lure (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Post Office", costumes: [
    { name: "Stamp", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Art Gallery", costumes: [
    { name: "Picture Frame", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Airport", costumes: [
    { name: "Toy Airplane", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Luggage Tag", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Station", costumes: [
    { name: "Paper Train", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Ticket", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Gold Ticket", colors: ["Red"] },
    { name: "Ticket (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Beach", costumes: [
    { name: "Shell", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Burger Place", costumes: [
    { name: "Burger", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Corner Store", costumes: [
    { name: "Bottle Cap", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Supermarket", costumes: [
    { name: "Mushroom", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Banana", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Banana (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Bakery", costumes: [
    { name: "Baguette", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Baguette (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Pastry", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Hair Salon", costumes: [
    { name: "Scissors", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Scissors (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Clothes Store", costumes: [
    { name: "Hair Tie", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Park", costumes: [
    { name: "Clover", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Four-Leaf Clover", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Clover (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Four-Leaf Clover (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Library & Bookstore", costumes: [
    { name: "Tiny Book", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Sushi Restaurant", costumes: [
    { name: "Sushi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Mountain", costumes: [
    { name: "Mountain Pin Badge", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Stadium", costumes: [
    { name: "Ball Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Ball Keychain (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Theme Park", costumes: [
    { name: "Theme Park Ticket", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Bus Stop", costumes: [
    { name: "Bus Papercraft", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Italian Restaurant", costumes: [
    { name: "Pizza", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Pasta", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Ramen Restaurant", costumes: [
    { name: "Ramen Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Bridge", costumes: [
    { name: "Bridge Pin Badge", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Hotel", costumes: [
    { name: "Hotel Amenities", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Makeup Store", costumes: [
    { name: "Makeup", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Appliances Store", costumes: [
    { name: "Battery", designs: ["1", "2", "3", "4", "5", "6"], color: "Yellow" },
    { name: "Fairy Lights", designs: ["1", "2"], color: "Yellow" },
  ]},
  { location: "Curry Restaurant", costumes: [
    { name: "Curry Bowl", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "DIY Store", costumes: [
    { name: "Tool", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "University & College", costumes: [
    { name: "College Crest Patch", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Mexican Restaurant", costumes: [
    { name: "Taco", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Laundromats & Dry Cleaners", costumes: [
    { name: "Laundry Item", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Korean Restaurant", costumes: [
    { name: "Kimchi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Stationery Store", costumes: [
    { name: "Stationery", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Roadside", costumes: [
    { name: "Sticker (Green)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Sticker (Blue)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Sticker (Orange)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Coin", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
    { name: "Coin (Rare)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Weather", costumes: [
    { name: "Rainy Day: Leaf Hat", colors: ["Blue"] },
    { name: "Snowy Day: Snow", colors: ["Blue", "White", "Ice"] },
  ]},
  { location: "Fortune", costumes: [
    { name: "Daikichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Kichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Chukichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Shokichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Suekichi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
];

export const DECOR_SPECIAL_CATEGORIES = [
  { location: "Super Mario Keychain", costumes: [
    { name: "Super Mario Keychain", colors: ["Red", "Yellow", "Blue", "Purple"] },
  ]},
  { location: "Lunar New Year Ornament", costumes: [
    { name: "Lunar New Year Ornament: Red", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Lunar New Year Ornament: Gold", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Chess Piece", costumes: [
    { name: "Chess Piece", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Fingerboard", costumes: [
    { name: "Fingerboard", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Hanafuda Card", costumes: [
    ...CARD_COSTUMES["Hanafuda Card"],
  ]},
  { location: "Jack-o'-Lantern", costumes: [
    { name: "Jack-o'-Lantern", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Halloween Treat", costumes: [
    { name: "Halloween Treat", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Halloween Light", costumes: [
    { name: "Halloween Light", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Halloween: Stained Glass", costumes: [
    { name: "Halloween: Stained Glass", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "First Anniversary Snack", costumes: [
    { name: "First Anniversary Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Koppaite Space Suit", costumes: [
    { name: "Koppaite Space Suit", colors: ["Red", "Yellow", "Blue"] },
  ]},
  { location: "Mitten", costumes: [
    { name: "Mitten", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "2023 Glasses", costumes: [
    { name: "2023 Glasses", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "2024 Glasses", costumes: [
    { name: "2024 Glasses", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Valentine Sticker", costumes: [
    { name: "Valentine Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Reverse Valentine's Day Sticker", costumes: [
    { name: "Reverse Valentine's Day Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Present Sticker (Gold)", costumes: [
    { name: "Present Sticker (Gold)", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Easter Egg", costumes: [
    { name: "Easter Egg", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Bunny Egg", costumes: [
    { name: "Bunny Egg", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Sneaker Keychain", costumes: [
    { name: "Sneaker Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Pikmin 4 Spaceship", costumes: [
    { name: "Pikmin 4 Spaceship", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Pikmin 4 Toy", costumes: [
    { name: "Pikmin 4 Toy", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Mahjong Tile", costumes: [
    ...CARD_COSTUMES["Mahjong Tile"],
  ]},
  { location: "Ice Cream", costumes: [
    { name: "Ice Cream: Classic", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Ice Cream: 2024 Flavor", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Ice Cream: Extra Flavor", colors: ["Ice"] },
  ]},
  { location: "Puzzle", costumes: [
    { name: "Puzzle: 2021 Fall Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Puzzle: 2022 Summer Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Puzzle: 2023 Summer Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
    { name: "Puzzle: 2024 Fall Memories", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Spring Sticker", costumes: [
    { name: "Spring Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Summer Sticker", costumes: [
    { name: "Summer Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Fall Sticker", costumes: [
    { name: "Fall Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Winter Sticker", costumes: [
    { name: "Winter Sticker", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Playing Card", costumes: [
    ...CARD_COSTUMES["Playing Card"],
  ]},
  { location: "Cheese", costumes: [
    { name: "Cheese", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Coral", costumes: [
    { name: "Coral", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Paint", costumes: [
    { name: "Paint", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Rosette", costumes: [
    { name: "Red Rosette", colors: ["Red"] },
    { name: "Yellow Rosette", colors: ["Yellow"] },
    { name: "Purple Rosette", colors: ["Purple"] },
  ]},
  { location: "3rd Anniversary Cupcake", costumes: [
    { name: "3rd Anniversary Cupcake", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Ball Ornament", costumes: [
    { name: "Ball Ornament", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Party Popper 2025", costumes: [
    { name: "Party Popper 2025", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Chocolate", costumes: [
    { name: "Chocolate", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Rio Carnival", costumes: [
    { name: "Rio Carnival", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Afternoon Tea", costumes: [
    { name: "Afternoon Tea", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Nintendo Consoles '80-'95", costumes: [
    { name: "Nintendo Consoles '80-'95", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Tiny Instrument: Brass Band", costumes: [
    { name: "Tiny Instrument: Brass Band", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Surfboard Keychain", costumes: [
    { name: "Surfboard Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "Shaved Ice", costumes: [
    { name: "Shaved Ice", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Mooncake", costumes: [
    { name: "Mooncake", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Photo Button Badge", costumes: [
    { name: "Photo Button Badge", colors: ["Red"] },
  ]},
  { location: "Calavera", costumes: [
    { name: "Calavera", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "4th Anniversary Flower Box", costumes: [
    { name: "4th Anniversary Flower Box", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "4th Anniversary Snack", costumes: [
    { name: "4th Anniversary Snack", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged"] },
  ]},
  { location: "2025 Ornament", costumes: [
    { name: "2025 Ornament", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Pacifier", costumes: [
    { name: "Pacifier", colors: ["Red"] },
  ]},
  { location: "Osechi", costumes: [
    { name: "Osechi", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "2026 Chocolate", costumes: [
    { name: "2026 Chocolate", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Color Powder", costumes: [
    { name: "Color Powder", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Klompen Keychain", costumes: [
    { name: "Klompen Keychain", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Game Pak", costumes: [
    { name: "Game Pak", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Flower Crown", costumes: [
    { name: "Flower Crown", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Tiny Instrument: Orchestra", costumes: [
    { name: "Tiny Instrument: Orchestra", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Balinese Carving", costumes: [
    { name: "Balinese Carving", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
  ]},
  { location: "Wurst", costumes: [
    { name: "Wurst", colors: ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"] },
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
  "Stationery Store": "✏️", "Roadside": "🛣️", "Weather": "🌦️", "Fortune": "🔮",
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

export const PIKMIN_COLORS = ["Red", "Yellow", "Blue", "Purple", "White", "Rock", "Winged", "Ice"];
export const PIKMIN_COLOR_HEX = {
  Red: "#e0453c", Yellow: "#eec32a", Blue: "#4a90d9", Purple: "#9b59b6",
  White: "#c9ccd1", Rock: "#8a7863", Winged: "#f28fb0", Ice: "#7fd4e0",
};
export const PIKMIN_COLOR_ABBR = { Red: "R", Yellow: "Y", Blue: "B", Purple: "P", White: "W", Rock: "Rk", Winged: "Wg", Ice: "Ic" };
