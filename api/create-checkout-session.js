// api/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      priceId,
      customerEmail,
      customerName,
      userId,
      successUrl,
      cancelUrl,
      metadata
    } = req.body;

    // Create customer if doesn't exist
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          userId: userId
        }
      });
    }

    // Determine if this is a subscription or one-time payment
    const isSubscription = metadata.type === 'subscription';

    const sessionConfig = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    if (isSubscription) {
      sessionConfig.mode = 'subscription';
      sessionConfig.subscription_data = {
        metadata: metadata
      };
    } else {
      sessionConfig.mode = 'payment';
      sessionConfig.payment_intent_data = {
        metadata: metadata
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ 
      message: 'Error creating checkout session',
      error: error.message 
    });
  }
}

// Webhook handler for payment confirmation
// api/stripe-webhook.js
export default async function webhookHandler(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update user subscription in your database
      await updateUserSubscription(session);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      
      // Handle subscription cancellation
      await handleSubscriptionCancellation(subscription);
      break;
      
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      
      // Handle failed payment
      await handleFailedPayment(invoice);
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
}

async function updateUserSubscription(session) {
  // Update your database with successful payment
  // This is where you'd update the user's subscription status
  console.log('Payment successful for session:', session.id);
  
  // Example database update (replace with your actual DB logic):
  /*
  await db.users.update({
    id: session.metadata.userId
  }, {
    subscriptionStatus: session.metadata.productType,
    subscriptionId: session.subscription,
    lastPaymentDate: new Date()
  });
  */
}

async function handleSubscriptionCancellation(subscription) {
  // Handle subscription cancellation
  console.log('Subscription cancelled:', subscription.id);
}

async function handleFailedPayment(invoice) {
  // Handle failed payment
  console.log('Payment failed for invoice:', invoice.id);
}