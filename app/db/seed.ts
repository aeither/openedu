import { db } from "./drizzle"; // Adjust import to your setup
import { campaigns, tasks, users } from "./schema"; // Adjust import to your schema

// Function to generate a random Ethereum address
function randomEthAddress(): string {
  const addr = "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
  return addr;
}

async function main() {
  // Clear existing data
  await db.delete(tasks);
  await db.delete(users);
  await db.delete(campaigns);

  // Create test users
  const addresses = Array(5).fill(0).map(() => randomEthAddress());
  for (const address of addresses) {
    await db.insert(users).values({
      address,
    }).onConflictDoNothing();
    console.log(`Inserted user: ${address}`);

    // Create welcome task for each user
    await db.insert(tasks).values({
      id: `welcome-${address}`,
      userAddress: address,
      taskName: "welcome",
      completed: false,
    }).onConflictDoNothing();
    console.log(`Inserted 'welcome' task for user: ${address}`);
  }

  // Seed the initial campaign
  await db.insert(campaigns).values({
    name: "Try to Earn Giveaway",
    totalAmount: "200",
    currentAmount: "0",
  }).onConflictDoNothing();
  console.log("Inserted initial campaign");

  console.log("Seeding completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
