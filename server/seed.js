import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import Fish from "./models/Fish.js";

const fishList = [
  { name: "Guppy", price: 250, size: "3-5 cm", stock: 40, description: "Small, colorful and very active. A great first fish.", careTips: "Keep water at 24-27°C. Feed twice a day in small amounts." },
  { name: "Betta (Fighter Fish)", price: 800, size: "6 cm", stock: 15, description: "Long flowing fins and bright colors.", careTips: "Keep one male per tank. Use warm, clean water." },
  { name: "Goldfish", price: 600, size: "8-10 cm", stock: 25, description: "Hardy and friendly fish with gold and orange colors.", careTips: "Needs a large tank and a good filter." },
  { name: "Angelfish", price: 1200, size: "10 cm", stock: 12, description: "Graceful fish with tall fins.", careTips: "Use a tall tank. Keep away from very small fish." },
  { name: "Oscar", price: 2500, size: "15 cm", stock: 6, description: "Big, smart fish that can know its owner.", careTips: "Needs a very large tank. Feed pellets and live food." },
  { name: "Discus", price: 6500, size: "12 cm", stock: 4, description: "The king of the aquarium with round, bright bodies.", careTips: "Needs very clean, warm water (28-30°C)." },
  { name: "Neon Tetra", price: 150, size: "3 cm", stock: 60, description: "Tiny fish with a shining blue stripe.", careTips: "Keep in groups of 6 or more." },
  { name: "Molly", price: 300, size: "6 cm", stock: 30, description: "Peaceful and easy to keep.", careTips: "Likes slightly salty water. Feed algae and flakes." },
  { name: "Platy", price: 220, size: "5 cm", stock: 35, description: "Cheerful, colorful and good for beginners.", careTips: "Keep in pairs or groups." },
  { name: "Koi", price: 4500, size: "20 cm", stock: 8, description: "Beautiful pond fish with bright patterns.", careTips: "Needs a pond or very large tank with strong filtering." },
  { name: "Flowerhorn", price: 9000, size: "18 cm", stock: 0, description: "A famous fish with a large head bump and strong colors.", careTips: "Keep alone in a big tank." },
  { name: "Silver Arowana", price: 15000, size: "25 cm", stock: 3, description: "A long, shiny fish that loves to swim near the top.", careTips: "Needs a very large tank with a tight lid." },
];

const seed = async () => {
  await connectDB();

  // Admin user (only created if not there)
  const adminEmail = process.env.ADMIN_EMAIL;
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    await User.create({
      name: "Farm Admin",
      email: adminEmail,
      phone: "0771234567",
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log("Admin already exists");
  }

  // Replace all fish with the 12 sample fish
  await Fish.deleteMany();
  await Fish.insertMany(fishList);
  console.log("12 sample fish added");

  await mongoose.disconnect();
  process.exit(0);
};

seed();