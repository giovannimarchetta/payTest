const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("⚠️ STRIPE_SECRET_KEY non trovata nelle variabili d'ambiente");
  process.exit(1);
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ["http://timeless.altervista.org", "https://timeless.altervista.org"]
}));

app.use(express.json());

// Stripe webhook route - usa bodyParser.raw per il parsing corretto
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log(`✅ Pagamento confermato per sessione ${session.id}`);
  }

  res.status(200).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});
