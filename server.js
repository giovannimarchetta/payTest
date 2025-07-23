// server.js
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(cors({
	origin: "https://frisiawards.altervista.org"
}));

app.use(express.static("public"));
app.use(express.json());

// Endpoint Stripe
app.post("/create-checkout-session", async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: [{
				price_data: {
					currency: "eur",
					product_data: {
						name: "Test Pagamento",
					},
					unit_amount: 500, // €5.00
				},
				quantity: 1,
			}],
			success_url: "https://frisiawards.altervista.org/success.html",
			cancel_url: "https://frisiawards.altervista.org/cancel.html",
		});

		console.log("✅ Sessione Stripe creata con ID:", session.id);
		res.json({ id: session.id });

	} catch (error) {
		console.error("❌ Errore nella creazione sessione:", error.message);
		res.status(500).json({ error: "Errore durante la creazione della sessione" });
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`✅ Server in ascolto sulla porta ${PORT}`);
});