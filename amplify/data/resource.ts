import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== BVESTER SCHEMA ===============================================================
Complete database schema for Bvester SME platform including user profiles,
transactions, assessments, subscriptions, and payment tracking.
=========================================================================*/
const schema = a.schema({
  // User Profile Schema
  UserProfile: a
    .model({
      userId: a.string().required(),
      businessName: a.string().required(),
      ownerName: a.string().required(),
      email: a.string().required(),
      phone: a.string(),
      location: a.string().required(),
      // Business branding and leadership
      businessLogo: a.string(),
      ceoName: a.string(),
      ceoEmail: a.string(),
      ceoPhone: a.string(),
      region: a.string().required(),
      businessType: a.string().required(),
      businessDescription: a.string(),
      registrationNumber: a.string(),
      tinNumber: a.string(),
      yearEstablished: a.string(),
      employeeCount: a.string(),
      businessStage: a.string(),
      // Enhanced user management fields
      role: a.enum(['owner', 'accountant', 'viewer']),
      profileCompletionPercentage: a.float().default(0),
      // Verification status
      isEmailVerified: a.boolean().default(false),
      isPhoneVerified: a.boolean().default(false),
      isBusinessVerified: a.boolean().default(false),
      emailVerificationToken: a.string(),
      phoneVerificationToken: a.string(),
      emailVerificationExpiry: a.datetime(),
      phoneVerificationExpiry: a.datetime(),
      emailVerificationAttempts: a.integer().default(0),
      phoneVerificationAttempts: a.integer().default(0),
      // Verification documents
      verificationDocuments: a.json(),
      // Security settings (JSON object)
      securitySettings: a.json(),
      // User preferences (JSON object)
      preferences: a.json(),
      // Individual fields for easier querying
      twoFactorEnabled: a.boolean().default(false),
      lastLoginAt: a.datetime(),
      // Profile metadata
      profileCompletedAt: a.datetime(),
      lastUpdated: a.datetime().required(),
    })
    .authorization(allow => [
      allow.ownerDefinedIn('userId'),
      allow.authenticated().to(['read']),
    ]),

  // Financial Transactions Schema
  Transaction: a
    .model({
      userId: a.string().required(),
      transactionId: a.string().required(),
      date: a.string().required(),
      type: a.enum(['income', 'expense']),
      category: a.string().required(),
      amount: a.float().required(),
      description: a.string(),
      paymentMethod: a.string(),
      // Transaction metadata
      createdAt: a.datetime().required(),
    })
    .authorization(allow => [
      allow.ownerDefinedIn('userId'),
    ]),

  // Business Assessment Schema
  BusinessAssessment: a
    .model({
      userId: a.string().required(),
      assessmentId: a.string().required(),
      // Assessment scores
      marketScore: a.float().required(),
      financialScore: a.float().required(),
      operationsScore: a.float().required(),
      teamScore: a.float().required(),
      growthScore: a.float().required(),
      totalScore: a.float().required(),
      // Assessment data
      responses: a.json().required(),
      recommendations: a.json(),
      // Assessment metadata
      completedAt: a.datetime().required(),
      reportGenerated: a.boolean().default(false),
    })
    .authorization(allow => [
      allow.ownerDefinedIn('userId'),
    ]),

  // Subscription Management Schema
  UserSubscription: a
    .model({
      userId: a.string().required(),
      // Platform subscription
      platformTier: a.enum(['free', 'pro', 'business']),
      platformExpiryDate: a.datetime(),
      stripeSubscriptionId: a.string(),
      stripeCustomerId: a.string(),
      cancelAtPeriodEnd: a.boolean().default(false),
      // Growth Accelerator access
      acceleratorAccess: a.enum(['none', 'enrolled', 'completed']),
      acceleratorEnrollmentDate: a.datetime(),
      acceleratorPaymentType: a.enum(['full', 'installment']),
      // Subscription metadata
      createdAt: a.datetime().required(),
      lastUpdated: a.datetime().required(),
      // Payment history tracking
      totalPaid: a.float().default(0),
      lastPaymentDate: a.datetime(),
    })
    .authorization(allow => [
      allow.ownerDefinedIn('userId'),
      allow.authenticated().to(['read']), // Allow other users to read for admin purposes
    ]),

  // Growth Accelerator Progress Schema
  AcceleratorProgress: a
    .model({
      userId: a.string().required(),
      // Module progress
      moduleId: a.string().required(),
      moduleTitle: a.string().required(),
      completed: a.boolean().default(false),
      completedAt: a.datetime(),
      // Progress tracking
      progress: a.float().default(0), // 0-100 percentage
      timeSpent: a.integer().default(0), // minutes
      // Module data
      responses: a.json(),
      notes: a.string(),
    })
    .authorization(allow => [
      allow.ownerDefinedIn('userId'),
    ]),

  // Payment Events Schema (for audit trail)
  PaymentEvent: a
    .model({
      userId: a.string().required(),
      eventId: a.string().required(),
      eventType: a.enum([
        'checkout_session_created',
        'payment_succeeded',
        'payment_failed',
        'subscription_created',
        'subscription_updated',
        'subscription_cancelled',
        'invoice_payment_succeeded',
        'invoice_payment_failed'
      ]),
      // Stripe data
      stripeEventId: a.string(),
      stripeCustomerId: a.string(),
      stripeSubscriptionId: a.string(),
      amount: a.float(),
      currency: a.string().default('GHS'),
      // Event metadata
      eventData: a.json(),
      processed: a.boolean().default(false),
      processedAt: a.datetime(),
      createdAt: a.datetime().required(),
    })
    .authorization(allow => [
      allow.authenticated().to(['create', 'read']),
    ]),

  // System Configuration Schema
  SystemConfig: a
    .model({
      configKey: a.string().required(),
      configValue: a.json().required(),
      description: a.string(),
      lastUpdated: a.datetime().required(),
    })
    .authorization(allow => [
      allow.authenticated().to(['read']),
      allow.group('Admins'),
    ]),

  // Keep original Todo for backward compatibility
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
