# Priority 1 Testing Guide - Security & Data Persistence

## ✅ What We've Implemented

### 1. **Database Infrastructure** ✓
- Complete DynamoDB schema with 6 main tables
- Proper authorization rules with user-based access
- Automated data migration from localStorage

### 2. **API Service Layer** ✓
- Comprehensive CRUD operations for all data types
- Error handling and validation
- Type-safe interfaces with TypeScript

### 3. **Secure Environment Configuration** ✓
- Environment variable validation
- Security utilities (email validation, input sanitization)
- Structured logging with data masking

### 4. **Enhanced Stripe Integration** ✓
- Server-side subscription verification
- Payment event logging
- Webhook signature verification
- Improved error handling

## 🧪 Testing Checklist

### **Phase 1: Database & Migration Testing**

#### Test 1: Data Migration
```bash
# Test data migration from localStorage to database
1. Clear any existing DynamoDB data
2. Add test data to localStorage:
   - User profile
   - Transactions (at least 5)
   - Subscription data
   - Assessment results
3. Load the app - migration should happen automatically
4. Verify data appears in DynamoDB tables
5. Verify data still loads correctly after browser refresh
```

#### Test 2: Database CRUD Operations
```bash
# Test UserProfile operations
1. Create new user profile
2. Update profile information
3. Verify changes persist across sessions

# Test Transaction operations
1. Add new transactions
2. Update existing transaction
3. Delete transaction
4. Verify list operations

# Test Subscription operations
1. Create default subscription
2. Update subscription tier
3. Verify status checks
```

### **Phase 2: Security Testing**

#### Test 3: Environment Variable Security
```bash
# Verify no hardcoded secrets in frontend
1. Build production bundle
2. Search bundle for stripe secret keys
3. Verify only publishable keys are present
4. Test missing environment variable handling
```

#### Test 4: Input Validation
```bash
# Test security validations
1. Try invalid email formats in forms
2. Test XSS attempts in text fields
3. Verify phone number validation (Ghana format)
4. Test SQL injection attempts (should be prevented by GraphQL)
```

#### Test 5: Webhook Security
```bash
# Test webhook signature verification
1. Send valid webhook with correct signature
2. Send webhook with invalid signature (should fail)
3. Send webhook with missing signature (should fail)
4. Verify webhook processing only works with valid signatures
```

### **Phase 3: Stripe Integration Testing**

#### Test 6: Payment Flow Security
```bash
# Test secure payment processing
1. Initiate checkout session
2. Verify payment event logging
3. Complete test payment
4. Verify webhook processing
5. Check subscription status update
```

#### Test 7: Subscription Verification
```bash
# Test server-side verification
1. Manually modify localStorage subscription
2. Refresh app - should sync with actual Stripe data
3. Test with expired subscription
4. Test with cancelled subscription
```

### **Phase 4: Error Handling Testing**

#### Test 8: Offline/Network Error Handling
```bash
# Test graceful degradation
1. Disconnect network during operation
2. Verify fallback to cached data
3. Test retry mechanisms
4. Verify error messages are user-friendly
```

#### Test 9: API Error Handling
```bash
# Test API failure scenarios
1. Invalid API responses
2. Rate limiting responses
3. Stripe API errors
4. DynamoDB connection issues
```

## 🔧 Setup Instructions

### **1. Deploy Database Schema**
```bash
# Deploy Amplify backend with new schema
npx amplify push

# Verify tables are created in AWS Console
# Check DynamoDB > Tables
```

### **2. Update Lambda Function**
```bash
# Upload new deployment.zip to AWS Lambda
# Set environment variables:
# - STRIPE_SECRET_KEY: sk_test_51P7ZjI...
# - STRIPE_WEBHOOK_SECRET: whsec_...

# Test Lambda function with test event
```

### **3. Configure Environment Variables**
```bash
# Update .env file with correct values
# Verify VITE_* variables are loaded
# Test environment validation
```

### **4. Frontend Testing**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run type checking
npm run build
```

## 🐛 Common Issues & Solutions

### Issue 1: "Missing environment variable"
**Solution:** Check .env file has VITE_ prefix for frontend variables

### Issue 2: "GraphQL schema not found"
**Solution:** Run `npx amplify push` to deploy schema

### Issue 3: "Webhook signature verification failed"
**Solution:** Verify STRIPE_WEBHOOK_SECRET is set in Lambda

### Issue 4: "No sessionId returned"
**Solution:** Check Lambda logs, verify Stripe test price IDs

### Issue 5: "Migration failed"
**Solution:** Check console logs, verify DynamoDB permissions

## ✅ Success Criteria

### **Must Pass:**
- [ ] All data migrates from localStorage to DynamoDB
- [ ] No hardcoded secrets in frontend bundle
- [ ] Webhook signature verification works
- [ ] Payment flow creates proper database records
- [ ] Subscription status syncs with Stripe
- [ ] Error handling prevents app crashes

### **Should Pass:**
- [ ] All CRUD operations work correctly
- [ ] Input validation prevents malicious data
- [ ] Offline mode works with cached data
- [ ] Performance is acceptable (< 2s loading)

### **Nice to Have:**
- [ ] Comprehensive error messages
- [ ] Detailed logging for debugging
- [ ] Graceful handling of edge cases

## 📊 Performance Benchmarks

### **Target Metrics:**
- Initial page load: < 3 seconds
- Database operations: < 1 second
- Payment initiation: < 2 seconds
- Data migration: < 10 seconds

### **Monitoring:**
- Check browser dev tools Network tab
- Monitor DynamoDB CloudWatch metrics
- Check Lambda function duration
- Monitor Stripe API response times

## 🚀 Next Steps After Testing

Once all tests pass:
1. Document any issues found and resolved
2. Create production environment variables
3. Set up monitoring and alerting
4. Plan Priority 2 implementation (State Management)

---

**⚠️ Important:** Test thoroughly in development before deploying to production. The database changes are structural and should be validated completely.