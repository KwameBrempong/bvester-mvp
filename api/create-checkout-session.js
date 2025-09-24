const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const {
      priceId,
      customerEmail,
      customerName,
      userId,
      successUrl,
      cancelUrl,
      metadata = {},
    } = req.body;

    if (!priceId || !customerEmail || !userId || !successUrl || !cancelUrl) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    let customer = existingCustomers.data[0];

    if (!customer) {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: { userId },
      });
    }

    const isSubscription = metadata.type === 'subscription';

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        userId,
      },
      subscription_data: isSubscription ? { metadata } : undefined,
      payment_intent_data: !isSubscription ? { metadata } : undefined,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      message: 'Error creating checkout session',
      error: error.message,
    });
  }
}

async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed:', event.data.object.id);
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription cancelled:', event.data.object.id);
      break;
    case 'invoice.payment_failed':
      console.log('Invoice payment failed:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

module.exports = createCheckoutSession;
module.exports.webhookHandler = webhookHandler;
