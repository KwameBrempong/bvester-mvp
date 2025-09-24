const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const respond = (statusCode, headers, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return respond(200, headers, {});
  }

  try {
    if (!event.body) {
      return respond(400, headers, { error: 'Missing request body' });
    }

    const { action, ...params } = JSON.parse(event.body);

    switch (action) {
      case 'create_checkout_session':
        return await createCheckoutSession(params, headers);
      case 'create_portal_session':
        return await createCustomerPortal(params, headers);
      case 'get_subscription_status':
        return await getSubscriptionStatus(params, headers);
      case 'cancel_subscription':
        return await cancelSubscription(params, headers);
      case 'update_payment_method':
        return await updatePaymentMethod(params, headers);
      case 'get_payment_methods':
        return await getPaymentMethods(params, headers);
      case 'get_invoices':
        return await getInvoices(params, headers);
      case 'generate_usage_report':
        return await generateUsageReport(params, headers);
      case 'webhook':
        return await handleWebhook(event, headers);
      default:
        return respond(400, headers, { error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Stripe handler error:', error);
    return respond(500, headers, { error: error.message || 'Internal server error' });
  }
};

async function createCheckoutSession(params, headers) {
  const {
    priceId,
    successUrl,
    cancelUrl,
    customerEmail,
    userId,
    productType = 'subscription',
  } = params;

  if (!priceId || !successUrl || !cancelUrl || !customerEmail || !userId) {
    return respond(400, headers, { error: 'Missing required parameters for checkout session' });
  }

  const sessionConfig = {
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: productType === 'subscription' ? 'subscription' : 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      userId,
      productType,
    },
  };

  if (params.trialDays) {
    sessionConfig.subscription_data = {
      trial_period_days: params.trialDays,
    };
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);
  return respond(200, headers, {
    sessionId: session.id,
    url: session.url,
  });
}

async function createCustomerPortal(params, headers) {
  const { customerId, returnUrl } = params;

  if (!customerId || !returnUrl) {
    return respond(400, headers, { error: 'customerId and returnUrl are required' });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return respond(200, headers, { url: portalSession.url });
}

async function getSubscriptionStatus(params, headers) {
  const { stripeSubscriptionId } = params;

  if (!stripeSubscriptionId) {
    return respond(400, headers, { error: 'stripeSubscriptionId is required' });
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    return respond(200, headers, {
      isActive: subscription.status === 'active' || subscription.status === 'trialing',
      plan: subscription.items?.data?.[0]?.price?.id || null,
      currentPeriodEnd: subscription.current_period_end || null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    });
  } catch (error) {
    console.error('getSubscriptionStatus error', error);
    return respond(500, headers, { error: error.message || 'Failed to retrieve subscription' });
  }
}

async function cancelSubscription(params, headers) {
  const { stripeSubscriptionId, cancelAtPeriodEnd = true } = params;

  if (!stripeSubscriptionId) {
    return respond(400, headers, { error: 'stripeSubscriptionId is required' });
  }

  try {
    const updated = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: !!cancelAtPeriodEnd,
    });

    return respond(200, headers, {
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      status: updated.status,
    });
  } catch (error) {
    console.error('cancelSubscription error', error);
    return respond(500, headers, { error: error.message || 'Failed to cancel subscription' });
  }
}

async function updatePaymentMethod(params, headers) {
  const { customerId, paymentMethodId } = params;

  if (!customerId || !paymentMethodId) {
    return respond(400, headers, { error: 'customerId and paymentMethodId are required' });
  }

  try {
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return respond(200, headers, { success: true });
  } catch (error) {
    console.error('updatePaymentMethod error', error);
    return respond(500, headers, { error: error.message || 'Failed to update payment method' });
  }
}

async function getPaymentMethods(params, headers) {
  const { customerId } = params;

  if (!customerId) {
    return respond(400, headers, { error: 'customerId is required' });
  }

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return respond(200, headers, { paymentMethods: paymentMethods.data });
  } catch (error) {
    console.error('getPaymentMethods error', error);
    return respond(500, headers, { error: error.message || 'Failed to fetch payment methods' });
  }
}

async function getInvoices(params, headers) {
  const { customerId, limit = 10 } = params;

  if (!customerId) {
    return respond(400, headers, { error: 'customerId is required' });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: Number(limit) || 10,
    });

    return respond(200, headers, { invoices: invoices.data });
  } catch (error) {
    console.error('getInvoices error', error);
    return respond(500, headers, { error: error.message || 'Failed to fetch invoices' });
  }
}

async function generateUsageReport(params, headers) {
  const { customerId, period } = params;

  if (!customerId || !period?.start || !period?.end) {
    return respond(400, headers, { error: 'customerId and period {start, end} are required' });
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
      created: {
        gte: Math.floor(new Date(period.start).getTime() / 1000),
        lte: Math.floor(new Date(period.end).getTime() / 1000),
      },
    });

    const totalPaid = invoices.data
      .filter((invoice) => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.amount_paid || 0), 0);

    return respond(200, headers, {
      invoices: invoices.data,
      totalPaid,
      currency: invoices.data[0]?.currency || 'ghs',
    });
  } catch (error) {
    console.error('generateUsageReport error', error);
    return respond(500, headers, { error: error.message || 'Failed to generate usage report' });
  }
}

async function handleWebhook(event, headers) {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return respond(400, headers, { error: 'Invalid signature' });
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeEvent.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(stripeEvent.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(stripeEvent.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(stripeEvent.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(stripeEvent.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(stripeEvent.data.object);
      break;
    default:
      console.log(`Unhandled event type ${stripeEvent.type}`);
  }

  return respond(200, headers, { received: true });
}

async function handleCheckoutCompleted(session) {
  console.log('Checkout completed', {
    userId: session.metadata?.userId,
    productType: session.metadata?.productType,
    customerId: session.customer,
    subscriptionId: session.subscription,
  });
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionCanceled(subscription) {
  console.log('Subscription canceled:', subscription.id);
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
}
