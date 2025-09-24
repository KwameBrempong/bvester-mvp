const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    region: 'eu-west-2' // London region to match your Lambda
});

const dynamodb = new AWS.DynamoDB();

// Table definitions for production
const tables = [
    {
        TableName: 'bvester-user-profiles',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'email', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'EmailIndex',
                KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [
            { Key: 'Project', Value: 'Bvester' },
            { Key: 'Environment', Value: 'Production' }
        ]
    },
    {
        TableName: 'bvester-transactions',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'transactionId', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'transactionId', AttributeType: 'S' },
            { AttributeName: 'date', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'DateIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' },
                    { AttributeName: 'date', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [
            { Key: 'Project', Value: 'Bvester' },
            { Key: 'Environment', Value: 'Production' }
        ]
    },
    {
        TableName: 'bvester-assessments',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'assessmentId', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'assessmentId', AttributeType: 'S' },
            { AttributeName: 'completedAt', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'CompletedAtIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' },
                    { AttributeName: 'completedAt', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [
            { Key: 'Project', Value: 'Bvester' },
            { Key: 'Environment', Value: 'Production' }
        ]
    },
    {
        TableName: 'bvester-subscriptions',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'stripeCustomerId', AttributeType: 'S' },
            { AttributeName: 'stripeSubscriptionId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'StripeCustomerIndex',
                KeySchema: [{ AttributeName: 'stripeCustomerId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'StripeSubscriptionIndex',
                KeySchema: [{ AttributeName: 'stripeSubscriptionId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [
            { Key: 'Project', Value: 'Bvester' },
            { Key: 'Environment', Value: 'Production' }
        ]
    },
    {
        TableName: 'bvester-payment-events',
        KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'eventId', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'eventId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
            { AttributeName: 'stripeEventId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'CreatedAtIndex',
                KeySchema: [
                    { AttributeName: 'userId', KeyType: 'HASH' },
                    { AttributeName: 'createdAt', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' }
            },
            {
                IndexName: 'StripeEventIndex',
                KeySchema: [{ AttributeName: 'stripeEventId', KeyType: 'HASH' }],
                Projection: { ProjectionType: 'ALL' }
            }
        ],
        BillingMode: 'PAY_PER_REQUEST',
        Tags: [
            { Key: 'Project', Value: 'Bvester' },
            { Key: 'Environment', Value: 'Production' }
        ]
    }
];

async function createTables() {
    console.log('🚀 Setting up DynamoDB tables for Bvester production...\n');

    for (const tableConfig of tables) {
        try {
            console.log(`📋 Creating table: ${tableConfig.TableName}`);

            // Check if table already exists
            try {
                await dynamodb.describeTable({ TableName: tableConfig.TableName }).promise();
                console.log(`✅ Table ${tableConfig.TableName} already exists, skipping...\n`);
                continue;
            } catch (error) {
                if (error.code !== 'ResourceNotFoundException') {
                    throw error;
                }
            }

            // Create table
            const result = await dynamodb.createTable(tableConfig).promise();
            console.log(`✅ Created table: ${tableConfig.TableName}`);
            console.log(`   ARN: ${result.TableDescription.TableArn}`);
            console.log(`   Status: ${result.TableDescription.TableStatus}\n`);

        } catch (error) {
            console.error(`❌ Failed to create table ${tableConfig.TableName}:`, error.message);
        }
    }

    console.log('🎉 DynamoDB setup complete!');
    console.log('\nNext steps:');
    console.log('1. Wait for tables to become ACTIVE (check AWS Console)');
    console.log('2. Update Lambda function with DynamoDB operations');
    console.log('3. Configure IAM role for Lambda to access DynamoDB');
}

async function listTables() {
    try {
        const result = await dynamodb.listTables().promise();
        console.log('\n📊 Current DynamoDB Tables:');

        const bvesterTables = result.TableNames.filter(name => name.startsWith('bvester-'));
        if (bvesterTables.length === 0) {
            console.log('   No Bvester tables found');
        } else {
            bvesterTables.forEach(table => console.log(`   ✓ ${table}`));
        }
        console.log('');
    } catch (error) {
        console.error('❌ Error listing tables:', error.message);
    }
}

// Run setup
async function main() {
    const command = process.argv[2];

    if (command === 'list') {
        await listTables();
    } else {
        await createTables();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { createTables, listTables };