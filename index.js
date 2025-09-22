// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// TEST MODE Price IDs from your Stripe Dashboard
const PRICE_IDS = {
  pro_monthly: 'price_1S9ohYGUhOvqkzBNKogIKA9A',      // Bvester Pro Plan Monthly (TEST)
  pro_yearly: 'price_1S9ohYGUhOvqkzBNm3e0HaTY',       // Bvester Pro Plan Annual (TEST)
  business_monthly: 'price_1S9olMGUhOvqkzBNKly5EBsw', // Bvester Business Plan Monthly (TEST)
  business_yearly: 'price_1S9olMGUhOvqkzBNJXoICO4V',  // Bvester Business Plan Annual (TEST)
  accelerator_full: 'price_1S9omIGUhOvqkzBNnonB74p5', // Growth Accelerator Program Flat (TEST)
  accelerator_installment: 'price_1S9pPsGUhOvqkzBNt6pmrvF1' // Growth Accelerator Program 3-Month Plan (TEST)
};

exports.handler = async (event) => {
  console.log('Lambda invoked with event:', JSON.stringify(event));

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Check if Stripe is properly initialized
  if (!stripe) {
    console.error('Stripe is not initialized - STRIPE_SECRET_KEY is missing');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Payment service not configured. Please contact support.',
        details: 'STRIPE_SECRET_KEY is not set in Lambda environment variables'
      })
    };
  }

  try {
    // Handle different event formats
    let body;
    if (typeof event.body === 'string') {
      body = JSON.parse(event.body);
    } else if (typeof event.body === 'object' && event.body !== null) {
      body = event.body;
    } else if (event.action) {
      // Direct invocation format
      body = event;
    } else {
      console.error('Invalid event format:', JSON.stringify(event));
      throw new Error('Invalid request format - no body found');
    }

    const { action, ...params } = body;
    console.log('Received action:', action, 'with params:', JSON.stringify(params));

    switch (action) {
      case 'create_checkout_session':
        return await createCheckoutSession(params, headers);
      
      case 'webhook':
        return await handleWebhook(event, headers);
      
      case 'get_customer_portal':
        return await createCustomerPortal(params, headers);
        
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.stack || 'No additional details available'
      })
    };
  }
};

async function createCheckoutSession(params, headers) {
  try {
    const {
      priceId,
      successUrl,
      cancelUrl,
      customerEmail,
      userId,
      productType = 'subscription' // 'subscription' or 'one_time'
    } = params;

    console.log('Creating checkout session with priceId:', priceId);

    if (!priceId) {
      throw new Error('priceId is required');
    }

    if (!successUrl || !cancelUrl) {
      throw new Error('successUrl and cancelUrl are required');
    }

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: productType === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      metadata: {
        userId: userId,
        productType: productType
      }
    };

    // For installment plans, limit to 3 payments
    if (priceId === PRICE_IDS.accelerator_installment) {
      sessionConfig.subscription_data = {
        metadata: {
          installment_plan: 'true',
          userId: userId
        }
      };
    }

    console.log('Creating Stripe session with config:', JSON.stringify(sessionConfig));

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created successfully:', session.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url,
        success: true
      })
    };
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        type: error.type || 'unknown_error',
        details: error.raw || error.stack
      })
    };
  }
}

async function createCustomerPortal(params, headers) {
  const { customerId, returnUrl } = params;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ url: portalSession.url })
  };
}

async function handleWebhook(event, headers) {
  console.log('Webhook received:', event.headers);

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook endpoint not properly configured' })
    };
  }

  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    console.error('No stripe signature header found');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No stripe signature header' })
    };
  }

  let stripeEvent;
  let rawBody = event.body;

  // Handle different body formats
  if (event.isBase64Encoded) {
    rawBody = Buffer.from(event.body, 'base64').toString();
  }

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log('Webhook signature verified successfully');
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    console.error('Signature:', sig);
    console.error('Body length:', rawBody?.length || 'undefined');
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: 'Invalid signature',
        message: err.message
      })
    };
  }

  console.log('Processing Stripe event:', stripeEvent.type, stripeEvent.id);

  try {
    // Handle the event with improved error handling
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
        // Still return success for unhandled events to prevent retries
    }

    // Log successful processing
    console.log('Successfully processed webhook:', stripeEvent.type, stripeEvent.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        received: true,
        eventId: stripeEvent.id,
        eventType: stripeEvent.type
      })
    };

  } catch (processingError) {
    console.error('Error processing webhook:', processingError);

    // Return 500 to trigger Stripe retry
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Webhook processing failed',
        eventId: stripeEvent.id,
        eventType: stripeEvent.type,
        message: processingError.message
      })
    };
  }
}

async function handleCheckoutCompleted(session) {
  const userId = session.metadata.userId;
  const productType = session.metadata.productType;
  
  console.log('Checkout completed for user:', userId, 'Product type:', productType);
  
  // Here you would typically:
  // 1. Update user subscription in your database
  // 2. Send confirmation email
  // 3. Grant access to features
  
  // For now, we'll log the successful payment
  console.log('Payment successful:', {
    userId,
    customerId: session.customer,
    subscriptionId: session.subscription,
    amountTotal: session.amount_total,
    currency: session.currency
  });
}

async function handleSubscriptionCreated(subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Determine which plan based on price ID
  const priceId = subscription.items.data[0].price.id;
  let planType = 'unknown';
  
  Object.entries(PRICE_IDS).forEach(([key, value]) => {
    if (value === priceId) {
      planType = key;
    }
  });
  
  console.log('Plan type:', planType, 'for customer:', subscription.customer);
  
  // Update your database here
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Subscription updated:', subscription.id);
  // Handle plan changes, payment method updates, etc.
}

async function handleSubscriptionCanceled(subscription) {
  console.log('Subscription canceled:', subscription.id);
  // Downgrade user to free tier
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  
  // For installment plans, check if this is the 3rd payment
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    if (subscription.metadata.installment_plan === 'true') {
      // Count how many invoices have been paid
      const invoices = await stripe.invoices.list({
        subscription: subscription.id,
        status: 'paid'
      });
      
      if (invoices.data.length >= 3) {
        // Cancel subscription after 3 payments
        await stripe.subscriptions.update(subscription.id, {
          cancel_at_period_end: true
        });
        
        console.log('Installment plan completed, subscription will cancel');
      }
    }
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // Handle failed payments - send email, retry logic, etc.
}
