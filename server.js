const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("⚠️ STRIPE_SECRET_KEY non trovata nelle variabili d'ambiente");
  process.exit(1);
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// CORS per Altervista
app.use(cors({
  origin: ["http://timeless.altervista.org", "https://timeless.altervista.org"]
}));

// ⚠️ Webhook DEVE venire PRIMA del parsing JSON!
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

// ✅ Dopo il webhook, ora puoi usare il JSON parser
app.use(express.json());

// Endpoint per creare la sessione di pagamento
app.post("/create-checkout-session", async (req, res) => {
  console.log("📩 Richiesta ricevuta su /create-checkout-session");

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Prodotto di test"
            },
            unit_amount: 1000 // €10.00
          },
          quantity: 1
        }
      ],
      success_url: "https://timeless.altervista.org/success.html",
      cancel_url: "https://timeless.altervista.org/cancel.html"
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("❌ Errore nella creazione della sessione:", err.message);
    res.status(500).json({ error: "Errore nella creazione della sessione" });
  }
});

// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server avviato sulla porta ${PORT}`);
});
