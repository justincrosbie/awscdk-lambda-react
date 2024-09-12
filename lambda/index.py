import json
import os
import boto3
from boto3.dynamodb.conditions import Key
import re
from collections import defaultdict
import traceback
import sys

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
comprehend = boto3.client('comprehend')

# Get environment variables
TABLE_NAME = os.environ['TABLE_NAME']
BUCKET_NAME = os.environ['BUCKET_NAME']

table = dynamodb.Table(TABLE_NAME)

def log_error(error_message):
    print(f"ERROR: {error_message}", file=sys.stderr)
    print(traceback.format_exc(), file=sys.stderr)

def normalize_text(text):
    return re.sub(r'[^a-z0-9\s]', '', text.lower())

def get_key_phrases(text):
    try:
        response = comprehend.detect_key_phrases(Text=text, LanguageCode='en')
        return [phrase['Text'].lower() for phrase in response['KeyPhrases']]
    except Exception as e:
        print(f"Error in get_key_phrases: {str(e)}")
        return []

def find_similar_intent(normalized_text, key_phrases):
    try:
        response = table.query(
            KeyConditionExpression=Key('normalized_text').eq(normalized_text)
        )
        if response['Items']:
            return response['Items'][0]['canonical_intent']
        
        for phrase in key_phrases:
            response = table.query(
                IndexName='KeyPhraseIndex',
                KeyConditionExpression=Key('key_phrase').eq(phrase)
            )
            if response['Items']:
                return response['Items'][0]['canonical_intent']
        
        return None
    except Exception as e:
        print(f"Error in find_similar_intent: {str(e)}")
        return None

def update_analytics(intent, canonical_intent):
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key='analytics.json')
        analytics = json.loads(response['Body'].read())
    except s3.exceptions.NoSuchKey:
        analytics = defaultdict(int)
    except Exception as e:
        print(f"Error reading analytics.json: {str(e)}")
        analytics = defaultdict(int)
    
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

def handle_post(body):
    try:
        intent = body['intent']
        normalized_text = normalize_text(intent)
        key_phrases = get_key_phrases(normalized_text)
        canonical_intent = find_similar_intent(normalized_text, key_phrases) or intent

        print(f"Putting item in DynamoDB: {normalized_text}")
        table.put_item(
            Item={
                'normalized_text': normalized_text,
                'original_intent': intent,
                'canonical_intent': canonical_intent,
                'key_phrases': key_phrases
            }
        )

        update_analytics(intent, canonical_intent)

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Intent processed successfully',
                'canonical_intent': canonical_intent
            })
        }
    except Exception as e:
        print(f"Error in handle_post: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing intent',
                'error': str(e)
            })
        }

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

def process_file_contents(contents):
    results = []
    for line in contents.split('\n'):
        line = line.strip()
        if line:
            print(f"Processing intent: {line}")
            result = handle_single_intent(line)
            results.append(result)
    return results

def handle_single_intent(intent):
    try:
        normalized_text = normalize_text(intent)
        print(f"Normalized text: {normalized_text}")
        
        key_phrases = get_key_phrases(normalized_text)
        print(f"Key phrases: {key_phrases}")
        
        canonical_intent = find_similar_intent(normalized_text, key_phrases) or normalized_text
        print(f"Canonical intent: {canonical_intent}")

        print(f"Putting item in DynamoDB: {normalized_text}")
        table.put_item(
            Item={
                'normalized_text': normalized_text,
                'original_intent': intent,
                'canonical_intent': canonical_intent,
                'key_phrases': key_phrases
            }
        )

        print(f"Updating analytics for: {canonical_intent}")
        update_analytics(intent, canonical_intent)

        return {
            'original_intent': intent,
            'canonical_intent': canonical_intent,
            'normalized_text': normalized_text,
            'key_phrases': key_phrases
        }
    except Exception as e:
        log_error(f"Error processing intent '{intent}': {str(e)}")
        return {
            'original_intent': intent,
            'error': str(e),
            'traceback': traceback.format_exc()
        }

def handle_update(body):
    try:
        file_name = body.get('file_name', 'intents.txt')
        print(f"Attempting to read file: {file_name} from bucket: {BUCKET_NAME}")
        response = s3.get_object(Bucket=BUCKET_NAME, Key=file_name)
        file_content = response['Body'].read().decode('utf-8')
        
        print(f"File contents: {file_content[:100]}...")  # Print first 100 characters
        
        results = process_file_contents(file_content)
        
        successful = [r for r in results if 'error' not in r]
        failed = [r for r in results if 'error' in r]
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'File processed',
                'total_processed': len(results),
                'successful': len(successful),
                'failed': len(failed),
                'failed_details': failed
            })
        }
    except Exception as e:
        log_error(f"Error in handle_update: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing file',
                'error': str(e),
                'traceback': traceback.format_exc()
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
        
        if http_method == 'POST' and resource == '/intents':
            body = json.loads(event['body'])
            return add_cors_headers(handle_post(body))
        elif http_method == 'GET' and resource == '/intents':
            return add_cors_headers(handle_get())
        elif http_method == 'POST' and resource == '/intents/update':
            body = json.loads(event['body'])
            return add_cors_headers(handle_update(body))
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