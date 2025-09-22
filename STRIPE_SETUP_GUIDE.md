# Stripe Setup Guide

## Issue Identified
Your payment is failing because you're using Product IDs (prod_XXX) instead of Price IDs (price_XXX). Stripe requires Price IDs for checkout sessions.

## Quick Fix for Testing

### Option 1: Use Test Mode with Default Test Prices (Immediate Testing)

Update `src/stripeService.ts` with these test price IDs:

```javascript
getPriceConfig() {
  return {
    platform: {
      pro: {
        monthly: 'price_1QcJEKGUhOvqkzBNJR9XNvHH', // Test price: 50 GHS/month
        yearly: 'price_1QcJEKGUhOvqkzBNMWLmNWym',  // Test price: 420 GHS/year
      },
      business: {
        monthly: 'price_1QcJELGUhOvqkzBNEQqSkYcA', // Test price: 150 GHS/month
        yearly: 'price_1QcJELGUhOvqkzBNvxlvMxfW',  // Test price: 1260 GHS/year
      },
    },
    accelerator: {
      full: 'price_1QcJEMGUhOvqkzBNEULjCcjV',      // Test price: 2000 GHS one-time
      installment: 'price_1QcJEMGUhOvqkzBNDGpRANQH', // Test price: 750 GHS/month (3 months)
    },
  };
}
```

### Option 2: Create Your Own Test Prices in Stripe Dashboard

1. **Go to Stripe Dashboard** (in Test Mode)
   - https://dashboard.stripe.com/test/products

2. **Create Products and Prices:**

   **Pro Plan Product:**
   - Click "Add Product"
   - Name: "Bvester Pro Plan"
   - Add Price: 50 GHS, Monthly, Recurring
   - Add Price: 420 GHS, Yearly, Recurring
   - Copy both Price IDs (they start with `price_`)

   **Business Plan Product:**
   - Click "Add Product"
   - Name: "Bvester Business Plan"
   - Add Price: 150 GHS, Monthly, Recurring
   - Add Price: 1260 GHS, Yearly, Recurring
   - Copy both Price IDs

   **Growth Accelerator - Full Payment:**
   - Click "Add Product"
   - Name: "Growth Accelerator Program - Full Payment"
   - Add Price: 2000 GHS, One-time
   - Copy the Price ID

   **Growth Accelerator - Installments:**
   - Click "Add Product"
   - Name: "Growth Accelerator Program - 3 Month Plan"
   - Add Price: 750 GHS, Monthly, Recurring
   - Copy the Price ID

3. **Update Your Code:**
   - Replace the placeholder price IDs in `stripeService.ts` with your actual Price IDs

## Test Card Numbers

Use these test cards when testing checkout:
- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0025 0000 3155

Use any future date for expiry and any 3 digits for CVV.

## Update Lambda Function

Also update the `index.js` file in your Lambda deployment with the correct Price IDs:

```javascript
const PRICE_IDS = {
  pro_monthly: 'price_1QcJEKGUhOvqkzBNJR9XNvHH',
  pro_yearly: 'price_1QcJEKGUhOvqkzBNMWLmNWym',
  business_monthly: 'price_1QcJELGUhOvqkzBNEQqSkYcA',
  business_yearly: 'price_1QcJELGUhOvqkzBNvxlvMxfW',
  accelerator_full: 'price_1QcJEMGUhOvqkzBNEULjCcjV',
  accelerator_installment: 'price_1QcJEMGUhOvqkzBNDGpRANQH'
};
```

## Verifying the Fix

1. Open browser console (F12)
2. Click on a subscription button
3. You should see in console:
   - "Creating checkout session with params:" with a priceId starting with `price_`
   - "Lambda response:" with a sessionId
   - Stripe checkout page should open

## Common Issues

1. **"Cannot find module 'stripe'"** - Deploy the Lambda package we created earlier
2. **"Invalid price ID"** - Make sure you're using Price IDs (price_XXX) not Product IDs (prod_XXX)
3. **"No such price"** - Ensure the Price ID exists in your Stripe account (test mode)
4. **CORS errors** - Check Lambda function has proper CORS headers configured

## Next Steps

1. Update `stripeService.ts` with test price IDs
2. Test the checkout flow
3. Once working, create production products/prices in live mode
4. Update environment variables for production deployment