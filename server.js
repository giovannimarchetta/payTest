const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.sk_test_51Ro6v8CbWJ1FIoMScixPJpAwNNc2pmB4GXwEJNJZfJx5KdFZpPkHlBXkBVL4ANG5wXuNCBegxb9bRDprzQ2sc0nb0061zeUy6g);
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Serve per il parsing JSON standard
app.use(cors({
  origin: "https://timeless.altervista.org"
}));
app.use(express.json());

// Serve per i Webhook (Stripe lo richiede in formato 'raw')
app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Errore nella verifica del webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gestione evento
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(`✅ Pagamento confermato da Stripe per sessione ${session.id}`);
    // Puoi anche: salvare su DB, inviare email, ecc.
  }

  res.status(200).json({ received: true });
});
