import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as logs from 'aws-cdk-lib/aws-logs';

export class IntentNormalizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB table for storing normalized intents
    const table = new dynamodb.Table(this, 'NormalizedIntents', {
      partitionKey: { name: 'normalized_text', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'KeyPhraseIndex',
      partitionKey: { name: 'key_phrase', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // S3 bucket for storing analytics data
    const bucket = new s3.Bucket(this, 'AnalyticsBucket', {
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    // Lambda function for intent normalization
    const normalizer = new lambda.Function(this, 'IntentNormalizer', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName,
      },
      timeout: cdk.Duration.seconds(300),  // Increase timeout to 5 minutes
      memorySize: 1024,  // Increase memory to 1 GB
      logRetention: logs.RetentionDays.ONE_WEEK,  // Retain logs for one week
    });

    // Grant the Lambda function read/write permissions to DynamoDB and S3
    table.grantReadWriteData(normalizer);
    bucket.grantReadWrite(normalizer);

    // Add permissions for Amazon Comprehend
    normalizer.addToRolePolicy(new iam.PolicyStatement({
      actions: ['comprehend:DetectKeyPhrases'],
      resources: ['*'],
    }));

    // API Gateway
    const api = new apigateway.RestApi(this, 'NormalizerApi', {
      restApiName: 'Intent Normalizer Service',
      description: 'This service normalizes intents and provides analytics.',
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://d1ohmnvezrnn40.cloudfront.net'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key'],
        allowCredentials: true,
      },
    });

    const intents = api.root.addResource('intents');
    
    intents.addMethod('POST', new apigateway.LambdaIntegration(normalizer, {
      proxy: true,
      integrationResponses: [{
        statusCode: '200',
      }],
    }));
    
    // GET method for retrieving normalized intents with counts
    intents.addMethod('GET', new apigateway.LambdaIntegration(normalizer, {
      proxy: true,
      integrationResponses: [{
        statusCode: '200',
      }],
    }));

    // New endpoint for processing file
    const update = intents.addResource('update');
    update.addMethod('POST', new apigateway.LambdaIntegration(normalizer, {
      proxy: true,
      integrationResponses: [{
        statusCode: '200',
      }],
    }));
    
    // DELETE method for clearing all data
    intents.addMethod('DELETE', new apigateway.LambdaIntegration(normalizer, {
      proxy: true,
      integrationResponses: [{
        statusCode: '200',
      }],
    }));

    // S3 bucket for React app
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      accessControl: s3.BucketAccessControl.BUCKET_OWNER_FULL_CONTROL,
    });

    // CloudFront distribution for React app
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
    });

    // Deploy React app to S3
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '..', 'intent-dashboard', 'build'))],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    // Output the API URL and CloudFront URL
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'DistributionUrl', { value: `https://${distribution.domainName}` });
  }
}