import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as path from 'path';
import * as logs from 'aws-cdk-lib/aws-logs';

export class IntentNormalizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
        BUCKET_NAME: bucket.bucketName,
        CSV_FILE_NAME: 'categorized_intents.csv',
      },
      timeout: cdk.Duration.seconds(300),
      memorySize: 2048,
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Grant the Lambda function read permissions to S3
    bucket.grantRead(normalizer);

    // API Gateway
    const api = new apigateway.RestApi(this, 'NormalizerApi', {
      restApiName: 'Intent Normalizer Service',
      description: 'This service provides intent analytics.',
      defaultCorsPreflightOptions: {
        // allowOrigins: ['https://dx6afv9vd0gy8.cloudfront.net', 'http://localhost:3001'],
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowCredentials: true,
      },
    });

    const intents = api.root.addResource('intents');
    
    // GET method for retrieving normalized intents with counts
    intents.addMethod('GET', new apigateway.LambdaIntegration(normalizer, {
      proxy: true,
    }));

    // New GET method for retrieving raw CSV data
    const csvData = api.root.addResource('data');
    csvData.addMethod('GET', new apigateway.LambdaIntegration(normalizer, {
      proxy: true,
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