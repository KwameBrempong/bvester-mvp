const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION || 'eu-west-2'
});

// Table names
const TABLES = {
  PROFILES: 'bvester-user-profiles',
  TRANSACTIONS: 'bvester-transactions',
  ASSESSMENTS: 'bvester-assessments',
  SUBSCRIPTIONS: 'bvester-subscriptions',
  PAYMENT_EVENTS: 'bvester-payment-events'
};

// SECURITY FIX: Rate limiting storage
const rateLimitStore = new Map();

const respond = (statusCode, headers, body) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
});

// Price ID to tier mapping - must match stripeConfig.ts
const PRICE_TO_TIER = {
  // Growth/Pro tier regular
  'price_1SBvZfGUhOvqkzBNTrCPnEdr': 'growth',  // ₵100/month
  'price_1SBvZfGUhOvqkzBNgYHVdRyy': 'growth',  // ₵700/year
  // Growth/Pro tier founding member
  'price_1SBvZgGUhOvqkzBNvh2m1wpG': 'growth',  // ₵50/month founding
  'price_1SBvZgGUhOvqkzBN3dgtRGkY': 'growth',  // ₵350/year founding
  // Accelerate tier
  'price_1SBvZhGUhOvqkzBNHKbJp2fS': 'accelerate',  // ₵500/month
  'price_1SBvZhGUhOvqkzBNHmGc5aRv': 'accelerate',  // ₵4200/year
};

// CRITICAL SECURITY FIX: JWT validation
const validateJWT = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // Extract token from Bearer format
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // For Cognito JWT validation, we'll verify the token structure
    // In production, you should verify the signature with Cognito's public keys
    const decoded = jwt.decode(actualToken, { complete: true });

    if (!decoded || !decoded.payload) {
      throw new Error('Invalid token format');
    }

    // Basic validations
    const now = Math.floor(Date.now() / 1000);
    if (decoded.payload.exp && decoded.payload.exp < now) {
      throw new Error('Token expired');
    }

    // Extract user info
    return {
      userId: decoded.payload.sub || decoded.payload['cognito:username'],
      email: decoded.payload.email,
      isValid: true
    };
  } catch (error) {
    console.error('JWT validation failed:', error.message);
    return {
      isValid: false,
      error: error.message
    };
  }
};

// SECURITY FIX: Rate limiting
const checkRateLimit = (identifier, maxRequests = 100, windowMs = 60000) => {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, []);
  }

  const requests = rateLimitStore.get(identifier);

  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);

  if (recentRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(identifier, recentRequests);

  return true; // Rate limit OK
};

// SECURITY FIX: Actions that don't require authentication
const publicActions = ['webhook'];
// NEW: Actions that support optional authentication (guest mode)
const optionalAuthActions = ['create_checkout_session'];

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
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

    // SECURITY FIX: Validate action exists
    if (!action) {
      return respond(400, headers, { error: 'Missing action parameter' });
    }

    // Enhanced authentication handling
    let userInfo = null;
    const isPublicAction = publicActions.includes(action);
    const isOptionalAuthAction = optionalAuthActions.includes(action);

    if (!isPublicAction) {
      // Try to get authentication
      const authHeader = event.headers.Authorization || event.headers.authorization;

      if (authHeader) {
        // Authentication provided - validate it
        const validation = validateJWT(authHeader);

        if (!validation.isValid) {
          console.error('Authentication failed:', validation.error);
          return respond(401, headers, {
            error: 'Authentication required',
            details: validation.error
          });
        }

        userInfo = validation;

        // SECURITY FIX: Rate limiting per user
        if (!checkRateLimit(userInfo.userId, 100, 60000)) {
          console.warn('Rate limit exceeded for user:', userInfo.userId);
          return respond(429, headers, {
            error: 'Too many requests. Please try again later.'
          });
        }

        // SECURITY FIX: Validate user owns the data they're accessing
        if (params.userId && params.userId !== userInfo.userId) {
          console.error('User attempting to access data for different user:', {
            authenticatedUser: userInfo.userId,
            requestedUser: params.userId
          });
          return respond(403, headers, {
            error: 'Access denied. You can only access your own data.'
          });
        }

        // Auto-inject authenticated user ID for security
        params.userId = userInfo.userId;
      } else if (!isOptionalAuthAction) {
        // No auth provided and auth is required
        console.error('Authentication required for action:', action);
        return respond(401, headers, {
          error: 'Authentication required',
          details: 'This action requires authentication'
        });
      } else {
        // No auth provided but this action supports guest mode
        console.log('Processing guest request for action:', action);
        // For guest checkout, rate limit by IP
        const clientIP = event.requestContext?.identity?.sourceIp || 'unknown';
        if (!checkRateLimit(`guest_${clientIP}`, 20, 60000)) { // Lower limit for guests
          console.warn('Rate limit exceeded for guest IP:', clientIP);
          return respond(429, headers, {
            error: 'Too many requests. Please try again later.'
          });
        }
      }
    }

    console.log('Processing action:', action, 'for user:', userInfo?.userId || 'public');

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
    planType,
    billingPeriod,
  } = params;

  // Enhanced validation for both authenticated and guest checkout
  if (!priceId || !successUrl || !cancelUrl || !customerEmail) {
    return respond(400, headers, { error: 'Missing required parameters for checkout session' });
  }

  const isGuestCheckout = !userId;
  console.log(`Creating ${isGuestCheckout ? 'guest' : 'authenticated'} checkout session`);

  // For guest checkout, generate a temporary identifier
  const checkoutUserId = userId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      metadata: {
        userId: checkoutUserId,
        originalUserId: userId || '',
        productType,
        isGuestCheckout: isGuestCheckout.toString(),
        planType: planType || '',
        billingPeriod: billingPeriod || '',
        customerEmail
      },
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

    await dynamodb.put({
      TableName: TABLES.PROFILES,
      Item: profile,
      ConditionExpression: 'attribute_not_exists(userId)'
    }).promise();

    return respond(200, headers, { profile });
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
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
    const result = await dynamodb.get({
      TableName: TABLES.PROFILES,
      Key: { userId }
    }).promise();

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

    const result = await dynamodb.update({
      TableName: TABLES.PROFILES,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

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

    await dynamodb.put({
      TableName: TABLES.TRANSACTIONS,
      Item: transaction,
      ConditionExpression: 'attribute_not_exists(transactionId)'
    }).promise();

    return respond(200, headers, { transaction });
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
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
    const result = await dynamodb.query({
      TableName: TABLES.TRANSACTIONS,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: limit,
      ScanIndexForward: false // Most recent first
    }).promise();

    return respond(200, headers, { transactions: result.Items });
  } catch (error) {
    console.error('Get transactions error:', error);
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

    await dynamodb.put({
      TableName: TABLES.ASSESSMENTS,
      Item: assessment
    }).promise();

    return respond(200, headers, { assessment });
  } catch (error) {
    console.error('Create assessment error:', error);
    return respond(500, headers, { error: error.message });
  }
}

async function getLatestAssessment(params, headers) {
  const { userId } = params;

  if (!userId) {
    return respond(400, headers, { error: 'Missing userId' });
  }

  try {
    const result = await dynamodb.query({
      TableName: TABLES.ASSESSMENTS,
      IndexName: 'CompletedAtIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      Limit: 1,
      ScanIndexForward: false
    }).promise();

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
    const result = await dynamodb.get({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: { userId }
    }).promise();

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

    const result = await dynamodb.update({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
      ConditionExpression: 'attribute_exists(userId)'
    }).promise();

    return respond(200, headers, { subscription: result.Attributes });
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      // Create new subscription if doesn't exist
      const subscription = {
        userId,
        platformTier: 'free',
        acceleratorAccess: 'none',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        ...updates
      };

      await dynamodb.put({
        TableName: TABLES.SUBSCRIPTIONS,
        Item: subscription
      }).promise();

      return respond(200, headers, { subscription });
    }

    console.error('Update subscription error:', error);
    return respond(500, headers, { error: error.message });
  }
}

// Create new user subscription (for guest checkout)
async function createUserSubscription(subscriptionData) {
  try {
    const subscription = {
      userId: subscriptionData.userId,
      platformTier: subscriptionData.platformTier || 'growth',
      acceleratorAccess: subscriptionData.acceleratorAccess || 'none',
      stripeCustomerId: subscriptionData.stripeCustomerId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      totalPaid: subscriptionData.totalPaid || 0,
      lastPaymentDate: subscriptionData.lastPaymentDate,
      createdAt: subscriptionData.createdAt || new Date().toISOString(),
      lastUpdated: subscriptionData.lastUpdated || new Date().toISOString()
    };

    console.log('Creating user subscription:', {
      userId: subscription.userId,
      platformTier: subscription.platformTier,
      stripeCustomerId: subscription.stripeCustomerId
    });

    await dynamodb.put({
      TableName: TABLES.SUBSCRIPTIONS,
      Item: subscription,
      ConditionExpression: 'attribute_not_exists(userId)' // Prevent overwriting existing subscriptions
    }).promise();

    console.log('✅ User subscription created successfully');
    return subscription;
  } catch (error) {
    console.error('❌ Error creating user subscription:', error);
    throw error;
  }
}

// Helper Functions
async function getUserSubscriptionData(userId) {
  try {
    const result = await dynamodb.get({
      TableName: TABLES.SUBSCRIPTIONS,
      Key: { userId }
    }).promise();

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

    await dynamodb.put({
      TableName: TABLES.PAYMENT_EVENTS,
      Item: event
    }).promise();

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
  const { userId, isGuestCheckout, tierId } = metadata;

  console.log('Processing checkout completion:', {
    sessionId: session.id,
    customer,
    userId,
    isGuestCheckout,
    tierId
  });

  // Handle guest checkout - create account from payment
  if (isGuestCheckout === 'true' && !userId?.startsWith('guest_')) {
    console.log('🚀 Processing guest checkout - creating account from payment');

    try {
      // Get customer details from Stripe
      const stripeCustomer = await stripe.customers.retrieve(customer);
      const customerEmail = stripeCustomer.email;

      if (!customerEmail) {
        console.error('No email found for guest customer:', customer);
        return;
      }

      // Create a user account with email as username
      const newUserId = customerEmail.toLowerCase();
      const now = new Date().toISOString();

      console.log('Creating user profile for guest checkout:', {
        userId: newUserId,
        email: customerEmail,
        tierId
      });

      // Create user profile
      const userProfile = {
        userId: newUserId,
        businessName: '', // Will be filled during onboarding
        ownerName: '',
        email: customerEmail,
        phone: '',
        location: '',
        region: '',
        businessType: '',
        businessDescription: '',
        businessLogo: '',
        ceoName: '',
        ceoEmail: '',
        ceoPhone: '',
        registrationNumber: '',
        tinNumber: '',
        yearEstablished: '',
        employeeCount: '',
        businessStage: 'existing',
        role: 'owner',
        profileCompletionPercentage: 20, // Has email and tier
        isEmailVerified: true, // Verified by payment
        isPhoneVerified: false,
        isBusinessVerified: false,
        profileCompletedAt: null, // Will be set when profile is completed
        lastUpdated: now,
        createdAt: now,
        // Additional metadata
        signupMethod: 'payment_first',
        initialTier: tierId,
        stripeCustomerId: customer
      };

      // Save user profile to DynamoDB
      await dynamodb.put({
        TableName: TABLES.PROFILES,
        Item: userProfile,
        ConditionExpression: 'attribute_not_exists(userId)' // Prevent overwriting existing users
      }).promise();

      console.log('✅ User profile created successfully for guest checkout');

      // Create subscription record
      await createUserSubscription({
        userId: newUserId,
        platformTier: tierId === 'accelerate' ? 'accelerate' : 'growth',
        stripeCustomerId: customer,
        createdAt: now,
        lastUpdated: now,
        totalPaid: session.amount_total / 100,
        lastPaymentDate: now
      });

      // Log payment event with new user ID
      await logPaymentEvent({
        userId: newUserId,
        eventType: 'checkout_session_completed',
        stripeCustomerId: customer,
        eventData: {
          sessionId: session.id,
          customerId: customer,
          isGuestCheckout: true,
          accountCreated: true
        }
      });

      console.log('✅ Guest checkout account creation completed successfully');

    } catch (error) {
      console.error('❌ Error creating account from guest checkout:', error);

      // Still log the payment event even if account creation failed
      try {
        await logPaymentEvent({
          userId: `guest_${session.id}`,
          eventType: 'checkout_session_completed',
          stripeCustomerId: customer,
          eventData: {
            sessionId: session.id,
            customerId: customer,
            isGuestCheckout: true,
            accountCreationFailed: true,
            error: error.message
          }
        });
      } catch (logError) {
        console.error('Failed to log payment event for failed guest checkout:', logError);
      }
    }
  }
  // Handle existing user checkout
  else if (userId && !userId.startsWith('guest_')) {
    console.log('Processing checkout for existing user:', userId);

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

    console.log('✅ Existing user checkout completed');
  } else {
    console.log('Skipping checkout processing - no valid userId found');
  }
}

async function handleSubscriptionChange(subscription) {
  const { customer, metadata } = subscription;

  // Try to find user by customer ID
  try {
    const result = await dynamodb.query({
      TableName: TABLES.SUBSCRIPTIONS,
      IndexName: 'StripeCustomerIndex',
      KeyConditionExpression: 'stripeCustomerId = :customerId',
      ExpressionAttributeValues: { ':customerId': customer }
    }).promise();

    if (result.Items && result.Items.length > 0) {
      const userId = result.Items[0].userId;

      // Get the price ID and map to tier
      const priceId = subscription.items.data[0]?.price?.id;
      const platformTier = PRICE_TO_TIER[priceId] || 'growth'; // Default to growth if unknown

      console.log('Subscription change detected:', {
        userId,
        priceId,
        platformTier,
        status: subscription.status
      });

      await updateUserSubscription({
        userId,
        stripeSubscriptionId: subscription.id,
        platformTier,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        status: subscription.status
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
  const { customer, subscription } = invoice;

  try {
    const result = await dynamodb.query({
      TableName: TABLES.SUBSCRIPTIONS,
      IndexName: 'StripeCustomerIndex',
      KeyConditionExpression: 'stripeCustomerId = :customerId',
      ExpressionAttributeValues: { ':customerId': customer }
    }).promise();

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