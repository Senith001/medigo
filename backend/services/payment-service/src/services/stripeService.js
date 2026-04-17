const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async ({
  appointmentId,
  doctorName,
  amount,
  currency = "lkr",
  successUrl,
  cancelUrl,
}) => {
  // Create a Stripe Checkout session for a consultation payment.
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `Consultation Fee - Dr. ${doctorName}`,
            description: `Appointment ID: ${appointmentId}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${cancelUrl}?session_id={CHECKOUT_SESSION_ID}`,
  });

  return session;
};

const retrieveCheckoutSession = async (sessionId) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

const createRefund = async (paymentIntentId) => {
  return await stripe.refunds.create({
    payment_intent: paymentIntentId,
  });
};

module.exports = {
  createCheckoutSession,
  retrieveCheckoutSession,
  createRefund,
};
