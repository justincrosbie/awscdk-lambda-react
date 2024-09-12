import json
import os
import boto3
from boto3.dynamodb.conditions import Key
import re
from collections import defaultdict
import traceback
import sys
import openai

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
secrets_manager = boto3.client('secretsmanager')

TABLE_NAME = os.environ['TABLE_NAME']
BUCKET_NAME = os.environ['BUCKET_NAME']
OPENAI_API_KEY_SECRET_NAME = os.environ['OPENAI_API_KEY_SECRET_NAME']

table = dynamodb.Table(TABLE_NAME)

# Retrieve the OpenAI API Key from Secrets Manager
def get_openai_api_key():
    try:
        response = secrets_manager.get_secret_value(SecretId=OPENAI_API_KEY_SECRET_NAME)
        return json.loads(response['SecretString'])['OPENAI_API_KEY']
    except Exception as e:
        print(f"Error retrieving OpenAI API Key: {str(e)}")
        raise

# Initialize OpenAI with the retrieved API key
openai.api_key = get_openai_api_key()

def normalize_intents(intents):
    prompt = f"""You are an AI assistant specialized in normalizing customer service intents. 
    Your task is to read the following list of intents and provide a normalized, canonical version for each.
    Use previous normalizations where applicable to maintain consistency.
    Here are the intents:

    {intents}

    For each intent, provide the normalized version in the following format:
    Original: [original intent]
    Normalized: [normalized intent]

    Ensure that the normalized intents are concise, clear, and consistent across similar requests."""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that normalizes customer service intents."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            n=1,
            stop=None,
            temperature=0.5,
        )

        results = response.choices[0].message['content'].strip()
        print(f"LLM results: {results}")
        
        return results
    except Exception as e:
        print(f"Error in normalize_intents: {str(e)}")
        raise

def parse_normalized_intents(normalized_text):
    lines = normalized_text.split('\n')
    parsed_intents = []
    current_intent = {}
    
    for line in lines:
        if line.startswith("Original:"):
            if current_intent:
                parsed_intents.append(current_intent)
                current_intent = {}
            current_intent['original'] = line.replace("Original:", "").strip()
        elif line.startswith("Normalized:"):
            current_intent['normalized'] = line.replace("Normalized:", "").strip()
    
    if current_intent:
        parsed_intents.append(current_intent)
    
    return parsed_intents

def update_dynamodb_and_analytics(parsed_intents):
    for intent in parsed_intents:
        table.put_item(
            Item={
                'normalized_text': intent['normalized'],
                'original_intent': intent['original'],
                'canonical_intent': intent['normalized'],
            }
        )
        update_analytics(intent['original'], intent['normalized'])

def update_analytics(intent, canonical_intent):
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key='analytics.json')
        analytics = json.loads(response['Body'].read())
    except s3.exceptions.NoSuchKey:
        analytics = {}
    except Exception as e:
        print(f"Error reading analytics.json: {str(e)}")
        analytics = {}
    
    analytics[canonical_intent] = analytics.get(canonical_intent, 0) + 1
    
    try:
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key='analytics.json',
            Body=json.dumps(analytics),
            ContentType='application/json'
        )
    except Exception as e:
        print(f"Error updating analytics.json: {str(e)}")

def handle_update(body):
    try:
        file_name = body.get('file_name', 'intents.txt')
        print(f"Attempting to read file: {file_name} from bucket: {BUCKET_NAME}")
        response = s3.get_object(Bucket=BUCKET_NAME, Key=file_name)
        file_content = response['Body'].read().decode('utf-8')
        
        print(f"File contents: {file_content[:100]}")  # Print first 100 characters
        
        normalized_text = normalize_intents(file_content)
        parsed_intents = parse_normalized_intents(normalized_text)
        update_dynamodb_and_analytics(parsed_intents)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'File processed successfully',
                'normalized_intents': parsed_intents
            })
        }
    except Exception as e:
        print(f"Error in handle_update: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing file',
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        }

def log_error(error_message):
    print(f"ERROR: {error_message}", file=sys.stderr)
    print(traceback.format_exc(), file=sys.stderr)



def get_normalized_intents():
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key='analytics.json')
        analytics = json.loads(response['Body'].read())
        return [{'intent': intent, 'count': count} for intent, count in analytics.items()]
    except s3.exceptions.NoSuchKey:
        return []
    except Exception as e:
        print(f"Error in get_normalized_intents: {str(e)}")
        return []

def add_cors_headers(response):
    response['headers'] = {
        'Access-Control-Allow-Origin': 'https://d1ohmnvezrnn40.cloudfront.net',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }
    return response


def handle_get():
    try:
        normalized_intents = get_normalized_intents()
        return {
            'statusCode': 200,
            'body': json.dumps({
                'normalized_intents': normalized_intents
            })
        }
    except Exception as e:
        print(f"Error in handle_get: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error retrieving normalized intents',
                'error': str(e)
            })
        }

def clear_all_data():
    try:
        # Clear DynamoDB table
        scan = table.scan()
        with table.batch_writer() as batch:
            for each in scan['Items']:
                batch.delete_item(
                    Key={
                        'normalized_text': each['normalized_text']
                    }
                )
        
        # Delete analytics.json from S3
        try:
            s3.delete_object(Bucket=BUCKET_NAME, Key='analytics.json')
        except s3.exceptions.NoSuchKey:
            # If the file doesn't exist, that's okay
            pass
        
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'All data cleared successfully'})
        }
    except Exception as e:
        log_error(f"Error clearing all data: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error clearing all data',
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        }

def handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        http_method = event['httpMethod']
        resource = event['resource']
        
        if http_method == 'POST' and resource == '/intents/update':
            body = json.loads(event['body'])
            return add_cors_headers(handle_update(body))
        elif http_method == 'GET' and resource == '/intents':
            return add_cors_headers(handle_get())
        elif http_method == 'DELETE' and resource == '/intents':
            return add_cors_headers(clear_all_data())
        elif http_method == 'OPTIONS':
            return add_cors_headers({
                'statusCode': 200,
                'body': json.dumps('OK')
            })
        else:
            return add_cors_headers({
                'statusCode': 405,
                'body': json.dumps({'message': 'Method not allowed'})
            })
    except Exception as e:
        log_error(f"Error in handler: {str(e)}")
        return add_cors_headers({
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing request',
                'error': str(e),
                'traceback': traceback.format_exc()
            })
        })