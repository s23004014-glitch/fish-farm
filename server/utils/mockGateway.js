import crypto from "crypto";

// Test cards. Anything else is refused, so a real card number is never processed.
const TEST_CARDS = {
  "4242424242424242": { brand: "Visa", approved: true },
  "5555555555554444": { brand: "Mastercard", approved: true },
  "4000000000000002": { brand: "Visa", approved: false, reason: "Your card was declined." },
  "4000000000009995": { brand: "Visa", approved: false, reason: "Insufficient funds." },
};

// Pretend to charge a card. The card number only lives inside this function.
export const charge = async ({ cardNumber }) => {
  await new Promise((r) => setTimeout(r, 800)); // pretend the bank is thinking

  const card = TEST_CARDS[cardNumber];
  if (!card) return { approved: false, reason: "Only test cards are accepted in demo mode." };
  if (!card.approved) return { approved: false, reason: card.reason };

  return {
    approved: true,
    paymentId: "DEMO-" + crypto.randomBytes(6).toString("hex").toUpperCase(),
    brand: card.brand,
    last4: cardNumber.slice(-4),
  };
};