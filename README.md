# Intent Dashboard Project

This project provides a complete end-to-end solution for categorizing intents and displaying their distribution through a user-friendly dashboard. The project consists of:
- **Backend**: A REST API implemented using AWS Lambda and written in Python. This API returns the categories and counts of a list of intents.
- **Frontend**: A React application that displays a dashboard with charts and leaderboards to visualize the intent data.
- **Infrastructure**: Defined using AWS Cloud Development Kit (CDK) in TypeScript, allowing for easy deployment of the backend and frontend on AWS.

## Project Structure
- **`cdk/`**: Contains the CDK stack definitions in TypeScript.
- **`lambda/`**: Contains the Python code for the AWS Lambda function.
- **`intent-dashboard/`**: Contains the React frontend application.

## Prerequisites
- AWS Account with programmatic access (AWS Access Key ID and Secret Access Key).
- AWS CLI installed and configured.
- Node.js and npm installed.
- Python and pip installed.
- AWS CDK installed globally (`npm install -g aws-cdk`).

## Setup Instructions

### Setting up AWS Credentials
To allow the AWS CDK to deploy resources to your AWS account, you need to set up your AWS credentials:

1. Set the AWS Access Key ID and Secret Access Key:
   ```bash
   export AWS_ACCESS_KEY_ID=<your-access-key-id>
   export AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
   ```

2. Optionally, you can configure your AWS CLI with a profile:
   ```bash
   aws configure
   ```
   Follow the prompts to enter your AWS credentials and default region.

### Building the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd intent-dashboard
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Build the frontend application:
   ```bash
   npm run build
   ```

### Deploying the Project
1. Navigate back to the root of the project where the CDK stack is defined.
2. Deploy the stack using the AWS CDK:
   ```bash
   cdk deploy
   ```

## Accessing the Dashboard
After deployment, the output of the `cdk deploy` command will provide you with the URL of the deployed frontend. Open this URL in your browser to access the dashboard displaying the intents data.

## Cleanup
To delete all the AWS resources created by this project, run:
```bash
cdk destroy
```

## Other useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Project Details
- **Backend**: The AWS Lambda function is triggered via API Gateway and serves a REST API that processes a list of intents and returns the categories along with their counts.
- **Frontend**: The React application fetches data from the backend and displays it in a user-friendly manner, utilizing charts and leaderboards for data visualization.

## License
This project is licensed under the MIT License.
The `cdk.json` file tells the CDK Toolkit how to execute your app.
