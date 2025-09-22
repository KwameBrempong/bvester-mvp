# AWS Lambda Environment Variable Setup

## CRITICAL: Your Lambda is missing the STRIPE_SECRET_KEY

The error you're experiencing is because the Lambda function doesn't have the Stripe secret key configured.

## Steps to Fix:

### 1. Get Your Stripe Secret Key
- Go to https://dashboard.stripe.com/test/apikeys
- Copy your **Secret key** (starts with `sk_test_`)
- ⚠️ NEVER share this key publicly

### 2. Set Environment Variable in AWS Lambda

#### Method 1: AWS Console (Recommended)
1. Go to AWS Lambda Console: https://console.aws.amazon.com/lambda
2. Click on your Lambda function
3. Click on the **Configuration** tab
4. Click on **Environment variables** in the left menu
5. Click **Edit**
6. Click **Add environment variable**
7. Add:
   - **Key:** `STRIPE_SECRET_KEY`
   - **Value:** Your Stripe secret key (e.g., `sk_test_51P7ZjI...`)
8. Click **Save**

#### Method 2: AWS CLI
```bash
aws lambda update-function-configuration \
  --function-name YOUR_FUNCTION_NAME \
  --environment Variables={STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE} \
  --region eu-west-2
```

### 3. Deploy the Updated Lambda Code
1. Upload the new `deployment.zip` file to your Lambda function
2. The updated code includes:
   - Validation for STRIPE_SECRET_KEY
   - Better error messages
   - Detailed logging

### 4. Test Your Setup

After setting the environment variable and deploying:

1. **Test in Lambda Console:**
   - Go to your Lambda function
   - Click **Test** tab
   - Create a new test event with:
   ```json
   {
     "httpMethod": "POST",
     "headers": {},
     "body": "{\"action\":\"create_checkout_session\",\"priceId\":\"price_1S9dZgGUhOvqkzBNUrlvi90V\",\"successUrl\":\"https://example.com/success\",\"cancelUrl\":\"https://example.com/cancel\",\"customerEmail\":\"test@example.com\",\"userId\":\"test123\"}"
   }
   ```
   - Click **Test**
   - Check the response - it should contain a sessionId

2. **Check CloudWatch Logs:**
   - Go to CloudWatch > Log groups
   - Find `/aws/lambda/YOUR_FUNCTION_NAME`
   - Check recent logs for error messages

3. **Test from your app:**
   - Open browser console (F12)
   - Try clicking a subscription button
   - You should now see either:
     - Success: Stripe checkout page opens
     - Error: Detailed error message about what's wrong

## What the Updated Code Does:

1. **Validates STRIPE_SECRET_KEY** exists before initializing Stripe
2. **Returns clear error messages** if the key is missing
3. **Logs all operations** for debugging in CloudWatch
4. **Handles errors gracefully** with detailed messages

## Common Issues:

### Issue: "Payment service not configured"
**Solution:** Set the STRIPE_SECRET_KEY environment variable

### Issue: "No such price"
**Solution:** Make sure you're using test mode secret key with test price IDs

### Issue: Still getting empty response
**Solution:** Check CloudWatch logs for the actual error

## Security Notes:

- Use `sk_test_` keys for testing
- Use `sk_live_` keys for production (different Lambda/environment)
- Never commit secret keys to git
- Consider using AWS Secrets Manager for production