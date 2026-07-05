import { createServerFn } from "@tanstack/react-start";
import Razorpay from "razorpay";
import crypto from "crypto";

// Server-side Razorpay instance — KEY_SECRET never reaches the browser
function getRazorpay() {
  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials are not configured. " +
        "Set VITE_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
    );
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

// Step 1: Create Razorpay Order
// Called from the frontend before opening the Razorpay modal.
// Returns: { order_id, amount, currency }
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as {
        amount: number; // in INR (rupees)
        receipt: string;
        currency?: string;
      }
  )
  .handler(async ({ data }) => {
    const amountInPaise = Math.round(data.amount * 100);

    if (amountInPaise < 100) {
      throw new Error("Order amount must be at least Rs.1 (100 paise).");
    }

    const rzp = getRazorpay();

    const order = await rzp.orders.create({
      amount: amountInPaise,
      currency: data.currency ?? "INR",
      receipt: data.receipt,
    });

    return {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  });

// Step 3: Verify Payment Signature
// Called from the frontend after Razorpay handler fires with payment details.
// Validates HMAC-SHA256 signature so we confirm payment is genuine before saving.
export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .validator(
    (data: unknown) =>
      data as {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }
  )
  .handler(async ({ data }) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing required payment fields for verification.");
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error("RAZORPAY_KEY_SECRET is not configured on the server.");
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Payment signature verification failed. Payment rejected.");
    }

    return { success: true, payment_id: razorpay_payment_id };
  });
