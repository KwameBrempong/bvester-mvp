# AWS Lambda Stripe Deployment Instructions

## Package Created Successfully!

Your deployment package `deployment.zip` has been created with all necessary dependencies.

## What's Included:
- `index.js` - Your Lambda function code
- `package.json` - Node.js dependencies configuration
- `node_modules/` - All installed dependencies including Stripe SDK

## How to Deploy to AWS Lambda:

### Option 1: Using AWS Console (Recommended for quick deployment)

1. **Open AWS Lambda Console**
   - Navigate to: https://console.aws.amazon.com/lambda
   - Select your region (e.g., eu-west-2)

2. **Find Your Lambda Function**
   - Click on your existing Lambda function name
   - Or create a new function if needed

3. **Upload the Deployment Package**
   - In the "Code" tab, click "Upload from" → ".zip file"
   - Click "Upload" and select the `deployment.zip` file from your project folder
   - Click "Save"

4. **Verify Configuration**
   - Runtime: Node.js 20.x (or 18.x if 20.x is not available)
   - Handler: index.handler (or your specific handler name)
   - Memory: At least 256 MB recommended
   - Timeout: At least 30 seconds for Stripe operations

### Option 2: Using AWS CLI

If you have AWS CLI configured, run:

```bash
aws lambda update-function-code \
  --function-name YOUR_FUNCTION_NAME \
  --zip-file fileb://deployment.zip \
  --region eu-west-2
```

Replace `YOUR_FUNCTION_NAME` with your actual Lambda function name.

## Important Notes:

1. **Environment Variables**: Make sure your Lambda function has the required environment variables set:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - Any other environment variables your function needs

2. **IAM Role**: Ensure your Lambda function has the necessary permissions

3. **API Gateway**: If using API Gateway, make sure:
   - CORS is properly configured
   - Method request/response are set up correctly
   - Deploy the API after updating the Lambda

4. **Testing**: After deployment:
   - Use the Lambda test console to verify the function works
   - Test with sample Stripe webhook events or API requests
   - Check CloudWatch logs for any errors

## File Location:
Your deployment package is located at:
`C:\Users\BREMPONG\Applications\bvester_new\bvester-mvp\deployment.zip`

## Troubleshooting:

If you encounter issues after deployment:

1. **Check CloudWatch Logs** for error messages
2. **Verify Environment Variables** are set correctly
3. **Ensure Node.js Runtime** matches (use Node.js 18.x or 20.x)
4. **Check IAM Permissions** if you get permission errors
5. **Verify API Gateway Integration** if using HTTP triggers

## Package Contents Verification:

The deployment package includes:
- Stripe SDK version: ^14.10.0
- All required dependencies for Stripe payment processing
- Your Lambda function code from index.js

This package is ready for immediate deployment and should resolve the "Cannot find module 'stripe'" error.