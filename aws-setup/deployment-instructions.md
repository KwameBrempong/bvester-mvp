# Production Deployment Instructions

## 🚀 Complete setup for Lambda + DynamoDB integration

### Step 1: Set up DynamoDB Tables

1. **Install AWS SDK dependencies** (if not already done):
```bash
cd aws-setup
npm install aws-sdk
```

2. **Create DynamoDB tables**:
```bash
node dynamodb-setup.js
```

3. **Verify tables created**:
```bash
node dynamodb-setup.js list
```

Expected tables:
- bvester-user-profiles
- bvester-transactions
- bvester-assessments
- bvester-subscriptions
- bvester-payment-events

### Step 2: Update Lambda Function

1. **Navigate to AWS Lambda Console**
2. **Find your existing Lambda function** (the one handling Stripe)
3. **Replace the function code** with `stripe-lambda/index-enhanced.js`
4. **Update environment variables**:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your webhook endpoint secret
   - `NODE_ENV`: production
   - `AWS_REGION`: eu-west-2

### Step 3: Configure IAM Permissions

1. **Go to AWS IAM Console**
2. **Find your Lambda execution role**
3. **Attach the policy** from `lambda-iam-policy.json`

**OR create new policy:**
1. IAM → Policies → Create Policy
2. JSON tab → paste content from `lambda-iam-policy.json`
3. Name: `BvesterLambdaDynamoDBPolicy`
4. Attach to your Lambda function's execution role

### Step 4: Update Frontend Data Service

The frontend needs to be updated to call Lambda endpoints instead of Amplify Data.

**Key changes needed:**
1. Update `src/services/dataService.ts` to call Lambda endpoints
2. Remove Amplify Data client usage
3. Update API calls to use proper Lambda actions

### Step 5: Deploy Updated Lambda

1. **Package the enhanced Lambda**:
```bash
cd stripe-lambda
zip -r ../lambda-deployment.zip index-enhanced.js package.json node_modules/
```

2. **Upload via AWS Console**:
   - Lambda Console → Your function → Upload from → .zip file
   - Choose `lambda-deployment.zip`

**OR use AWS CLI**:
```bash
aws lambda update-function-code \
  --function-name YOUR_FUNCTION_NAME \
  --zip-file fileb://lambda-deployment.zip \
  --region eu-west-2
```

### Step 6: Test Integration

1. **Open the test page**: `test-connections.html`
2. **Run full integration test**
3. **Test each Lambda action**:
   - User profile operations
   - Transaction management
   - Assessment handling
   - Subscription management

### Step 7: Update Frontend API Calls

**New Lambda Actions Available:**

**User Profile:**
```javascript
// Create profile
await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create_user_profile',
    userId: 'user123',
    businessName: 'My Business',
    email: 'user@example.com'
  })
});

// Get profile
await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'get_user_profile',
    userId: 'user123'
  })
});
```

**Transactions:**
```javascript
// Create transaction
await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create_transaction',
    userId: 'user123',
    transactionId: 'txn_' + Date.now(),
    amount: 100,
    type: 'income',
    category: 'sales'
  })
});

// Get transactions
await fetch(API_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'get_transactions',
    userId: 'user123',
    limit: 50
  })
});
```

### Step 8: Production Checklist

- [ ] DynamoDB tables created and active
- [ ] Lambda function updated with enhanced code
- [ ] IAM permissions configured
- [ ] Environment variables set
- [ ] Frontend API calls updated
- [ ] Stripe webhooks configured
- [ ] Error handling implemented
- [ ] Monitoring and logging enabled

### Environment Variables for Lambda

Required environment variables:
```
STRIPE_SECRET_KEY=sk_live_... (use test key for testing)
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_REGION=eu-west-2
NODE_ENV=production
```

### Monitoring & Troubleshooting

1. **CloudWatch Logs**: Monitor Lambda execution logs
2. **DynamoDB Metrics**: Check table performance
3. **API Gateway Logs**: Monitor API calls
4. **Stripe Dashboard**: Monitor webhook delivery

### Cost Optimization

- **DynamoDB**: Using Pay-Per-Request billing mode
- **Lambda**: Optimized function memory and timeout
- **Monitoring**: Set up billing alerts

## 🎉 You're Ready for Production!

Your app now has:
- ✅ Scalable DynamoDB backend
- ✅ Robust Lambda API
- ✅ Stripe payment integration
- ✅ Real-time data persistence
- ✅ Production-ready architecture