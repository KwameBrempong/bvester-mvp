const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Configure DynamoDB with AWS SDK v3
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-west-2' });
const dynamodb = DynamoDBDocumentClient.from(client);

// Table names
const TABLES = {
  PROFILES: 'bvester-user-profiles',
  TRANSACTIONS: 'bvester-transactions',
  ASSESSMENTS: 'bvester-assessments',
  SUBSCRIPTIONS: 'bvester-subscriptions',
  PAYMENT_EVENTS: 'bvester-payment-events'
};

const respond = (statusCode, headers, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
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
      // Stripe actions
      case 'create_checkout_session':
        return await createCheckoutSession(params, headers);
      case 'create_portal_session':
        return await createCustomerPortal(params, headers);
      case 'get_subscription_status':
        return await getSubscriptionStatus(params, headers);
      case 'cancel_subscription':
        return await cancelSubscription(params, headers);
      case 'webhook':
        return await handleWebhook(event, headers);

      // User Profile actions
      case 'create_user_profile':
        return await createUserProfile(params, headers);
      case 'get_user_profile':
        return await getUserProfile(params, headers);
      case 'update_user_profile':
        return await updateUserProfile(params, headers);

      // Transaction actions
      case 'create_transaction':
        return await createTransaction(params, headers);
      case 'get_transactions':
        return await getTransactions(params, headers);
      case 'update_transaction':
        return await updateTransaction(params, headers);
      case 'delete_transaction':
        return await deleteTransaction(params, headers);

      // Assessment actions
      case 'create_assessment':
        return await createAssessment(params, headers);
      case 'get_assessments':
        return await getAssessments(params, headers);
      case 'get_latest_assessment':
        return await getLatestAssessment(params, headers);

      // Subscription actions
      case 'get_user_subscription':
        return await getUserSubscription(params, headers);
      case 'update_user_subscription':
        return await updateUserSubscription(params, headers);

      default:
        return respond(400, headers, { error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Lambda handler error:', error);
    return respond(500, headers, {
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ===== STRIPE FUNCTIONS =====

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

  try {
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
      metadata: { userId, productType },
    };

    if (params.trialDays) {
      sessionConfig.subscription_data = {
        trial_period_days: params.trialDays,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Log payment event
    await logPaymentEvent({
      userId,
      eventType: 'checkout_session_created',
      eventData: {
        sessionId: session.id,
        priceId,
        productType,
        customerEmail
      }
    });

    return respond(200, headers, {
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function createCustomerPortal(params, headers) {
  const { customerId, returnUrl } = params;

  if (!customerId || !returnUrl) {
    return respond(400, headers, { error: 'Missing customerId or returnUrl' });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return respond(200, headers, { url: session.url });
  } catch (error) {
    console.error('Portal session creation error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function getSubscriptionStatus(params, headers) {
  const { userId, customerId } = params;

  if (!userId && !customerId) {
    return respond(400, headers, { error: 'Missing userId or customerId' });
  }

  try {
    // Get subscription from DynamoDB if userId provided
    if (userId) {
      const subscription = await getUserSubscriptionData(userId);
      if (subscription && subscription.stripeCustomerId) {
        const customer = await stripe.customers.retrieve(subscription.stripeCustomerId);
        const subscriptions = await stripe.subscriptions.list({
          customer: subscription.stripeCustomerId,
        });

        return respond(200, headers, {
          customer,
          subscriptions: subscriptions.data,
          localSubscription: subscription
        });
      }
    }

    // Fallback to direct Stripe lookup
    if (customerId) {
      const customer = await stripe.customers.retrieve(customerId);
      const subscriptions = await stripe.subscriptions.list({ customer: customerId });

      return respond(200, headers, {
        customer,
        subscriptions: subscriptions.data,
      });
    }

    return respond(404, headers, { error: 'Subscription not found' });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function cancelSubscription(params, headers) {
  const { subscriptionId } = params;

  if (!subscriptionId) {
    return respond(400, headers, { error: 'Missing subscriptionId' });
  }

  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return respond(200, headers, { subscription });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function handleWebhook(event, headers) {
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.warn('No webhook secret configured');
    return respond(400, headers, { error: 'Webhook secret not configured' });
  }

  try {
    const stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);

    console.log('Processing webhook:', stripeEvent.type);

    // Process the event and update DynamoDB
    await processStripeWebhook(stripeEvent);

    return respond(200, headers, { received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return respond(400, headers, { error: error.message });
  }
}

// ===== DYNAMODB FUNCTIONS =====

// User Profile Functions
async function createUserProfile(params, headers) {
  const { userId, ...profileData } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const profile = {
      userId,
      ...profileData,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLES.PROFILES,
      Item: profile,
      ConditionExpression: 'attribute_not_exists(userId)'
    });

    await dynamodb.send(command);

    return respond(200, headers, { profile });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return respond(409, headers, { error: 'Profile already exists' });
    }
    console.error('Create profile error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function getUserProfile(params, headers) {
  const { userId } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const command = new GetCommand({
      TableName: TABLES.PROFILES,
      Key: { userId }
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      return respond(404, headers, { error: 'Profile not found' });
    }

    return respond(200, headers, { profile: result.Item });
  } catch (error) {
    console.error('Get profile error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function updateUserProfile(params, headers) {
  const { userId, ...updates } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    // Build update expression
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key];
    });

    expressionAttributeNames['#lastUpdated'] = 'lastUpdated';
    expressionAttributeValues[':lastUpdated'] = new Date().toISOString();
    updateExpression.push('#lastUpdated = :lastUpdated');

    const command = new UpdateCommand({
      TableName: TABLES.PROFILES,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await dynamodb.send(command);

    return respond(200, headers, { profile: result.Attributes });
  } catch (error) {
    console.error('Update profile error:', error);
    return respond(500, headers, { error: error.message });
  }
}

// Transaction Functions
async function createTransaction(params, headers) {
  const { userId, transactionId, ...transactionData } = params;

  if (!userId || !transactionId) {
    return respond(400, headers, { error: 'Missing userId or transactionId' });
  }

  try {
    const transaction = {
      userId,
      transactionId,
      ...transactionData,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLES.TRANSACTIONS,
      Item: transaction,
      ConditionExpression: 'attribute_not_exists(transactionId)'
    });

    await dynamodb.send(command);

    return respond(200, headers, { transaction });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return respond(409, headers, { error: 'Transaction already exists' });
    }
    console.error('Create transaction error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function getTransactions(params, headers) {
  const { userId, limit = 100 } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLES.TRANSACTIONS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false // Most recent first
    });

    const result = await dynamodb.send(command);

    return respond(200, headers, { transactions: result.Items });
  } catch (error) {
    console.error('Get transactions error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function updateTransaction(params, headers) {
  const { userId, transactionId, ...updates } = params;

  if (!userId || !transactionId) {
    return respond(400, headers, { error: 'Missing userId or transactionId' });
  }

  try {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key];
    });

    const command = new UpdateCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { userId, transactionId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await dynamodb.send(command);

    return respond(200, headers, { transaction: result.Attributes });
  } catch (error) {
    console.error('Update transaction error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function deleteTransaction(params, headers) {
  const { userId, transactionId } = params;

  if (!userId || !transactionId) {
    return respond(400, headers, { error: 'Missing userId or transactionId' });
  }

  try {
    const command = new DeleteCommand({
      TableName: TABLES.TRANSACTIONS,
      Key: { userId, transactionId }
    });

    await dynamodb.send(command);

    return respond(200, headers, { success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return respond(500, headers, { error: error.message });
  }
}

// Assessment Functions
async function createAssessment(params, headers) {
  const { userId, assessmentId, ...assessmentData } = params;

  if (!userId || !assessmentId) {
    return respond(400, headers, { error: 'Missing userId or assessmentId' });
  }

  try {
    const assessment = {
      userId,
      assessmentId,
      ...assessmentData,
      completedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLES.ASSESSMENTS,
      Item: assessment
    });

    await dynamodb.send(command);

    return respond(200, headers, { assessment });
  } catch (error) {
    console.error('Create assessment error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function getAssessments(params, headers) {
  const { userId, limit = 10 } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLES.ASSESSMENTS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false
    });

    const result = await dynamodb.send(command);

    return respond(200, headers, { assessments: result.Items });
  } catch (error) {
    console.error('Get assessments error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function getLatestAssessment(params, headers) {
  const { userId } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const command = new QueryCommand({
      TableName: TABLES.ASSESSMENTS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: 1,
      ScanIndexForward: false
    });

    const result = await dynamodb.send(command);

    if (!result.Items || result.Items.length === 0) {
      return respond(404, headers, { error: 'No assessments found' });
    }

    return respond(200, headers, { assessment: result.Items[0] });
  } catch (error) {
    console.error('Get latest assessment error:', error);
    return respond(500, headers, { error: error.message });
  }
}

// Subscription Functions
async function getUserSubscription(params, headers) {
  const { userId } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const command = new GetCommand({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: { userId }
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      return respond(404, headers, { error: 'Subscription not found' });
    }

    return respond(200, headers, { subscription: result.Item });
  } catch (error) {
    console.error('Get subscription error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function updateUserSubscription(params, headers) {
  const { userId, ...updates } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    // Build update expression
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key];
    });

    expressionAttributeNames['#lastUpdated'] = 'lastUpdated';
    expressionAttributeValues[':lastUpdated'] = new Date().toISOString();
    updateExpression.push('#lastUpdated = :lastUpdated');

    const command = new UpdateCommand({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
      ConditionExpression: 'attribute_exists(userId)'
    });

    const result = await dynamodb.send(command);

    return respond(200, headers, { subscription: result.Attributes });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // Create new subscription if doesn't exist
      const subscription = {
        userId,
        platformTier: 'free',
        acceleratorAccess: 'none',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        ...updates
      };

      const command = new PutCommand({
        TableName: TABLES.SUBSCRIPTIONS,
        Item: subscription
      });

      await dynamodb.send(command);

      return respond(200, headers, { subscription });
    }

    console.error('Update subscription error:', error);
    return respond(500, headers, { error: error.message });
  }
}

// Helper Functions
async function getUserSubscriptionData(userId) {
  try {
    const command = new GetCommand({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: { userId }
    });

    const result = await dynamodb.send(command);

    return result.Item || null;
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return null;
  }
}

async function logPaymentEvent(eventData) {
  try {
    const event = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...eventData
    };

    const command = new PutCommand({
      TableName: TABLES.PAYMENT_EVENTS,
      Item: event
    });

    await dynamodb.send(command);

    console.log('Payment event logged:', event.eventType);
  } catch (error) {
    console.error('Error logging payment event:', error);
    // Don't throw - payment events are for tracking only
  }
}

async function processStripeWebhook(stripeEvent) {
  const { type, data } = stripeEvent;

  try {
    switch (type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(data.object);
        break;
      default:
        console.log(`Unhandled webhook event: ${type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook ${type}:`, error);
    throw error;
  }
}

async function handleCheckoutCompleted(session) {
  const { customer, metadata } = session;
  const { userId } = metadata;

  if (userId) {
    await logPaymentEvent({
      userId,
      eventType: 'checkout_session_completed',
      stripeCustomerId: customer,
      eventData: {
        sessionId: session.id,
        customerId: customer
      }
    });

    // Update user subscription with Stripe customer ID
    await updateUserSubscription({
      userId,
      stripeCustomerId: customer,
      lastPaymentDate: new Date().toISOString()
    });
  }
}

async function handleSubscriptionChange(subscription) {
  const { customer } = subscription;

  // Try to find user by customer ID
  try {
    const command = new QueryCommand({
      TableName: TABLES.SUBSCRIPTIONS,
      IndexName: 'StripeCustomerIndex',
      KeyConditionExpression: 'stripeCustomerId = :customerId',
      ExpressionAttributeValues: { ':customerId': customer }
    });

    const result = await dynamodb.send(command);

    if (result.Items && result.Items.length > 0) {
      const userId = result.Items[0].userId;

      await updateUserSubscription({
        userId,
        stripeSubscriptionId: subscription.id,
        platformTier: subscription.items.data[0]?.price?.id === 'price_1QW9M2GUhOvqkzBNv7UXGJG0' ? 'pro' : 'business',
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });

      await logPaymentEvent({
        userId,
        eventType: 'subscription_updated',
        stripeSubscriptionId: subscription.id,
        eventData: subscription
      });
    }
  } catch (error) {
    console.error('Error handling subscription change:', error);
  }
}

async function handlePaymentSucceeded(invoice) {
  const { customer } = invoice;

  try {
    const command = new QueryCommand({
      TableName: TABLES.SUBSCRIPTIONS,
      IndexName: 'StripeCustomerIndex',
      KeyConditionExpression: 'stripeCustomerId = :customerId',
      ExpressionAttributeValues: { ':customerId': customer }
    });

    const result = await dynamodb.send(command);

    if (result.Items && result.Items.length > 0) {
      const userId = result.Items[0].userId;

      await updateUserSubscription({
        userId,
        lastPaymentDate: new Date().toISOString(),
        totalPaid: (result.Items[0].totalPaid || 0) + (invoice.amount_paid / 100)
      });

      await logPaymentEvent({
        userId,
        eventType: 'payment_succeeded',
        stripeCustomerId: customer,
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        eventData: invoice
      });
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

async function handleSubscriptionCancelled(subscription) {
  const { customer } = subscription;

  try {
    const command = new QueryCommand({
      TableName: TABLES.SUBSCRIPTIONS,
      IndexName: 'StripeCustomerIndex',
      KeyConditionExpression: 'stripeCustomerId = :customerId',
      ExpressionAttributeValues: { ':customerId': customer }
    });

    const result = await dynamodb.send(command);

    if (result.Items && result.Items.length > 0) {
      const userId = result.Items[0].userId;

      await updateUserSubscription({
        userId,
        platformTier: 'free',
        stripeSubscriptionId: null,
        cancelAtPeriodEnd: false
      });

      await logPaymentEvent({
        userId,
        eventType: 'subscription_cancelled',
        stripeCustomerId: customer,
        eventData: subscription
      });
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}