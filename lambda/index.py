import json
import os
import boto3
import csv
from io import StringIO
from collections import defaultdict
import traceback

# Initialize AWS client
s3 = boto3.client('s3')

# Get environment variables
BUCKET_NAME = os.environ['BUCKET_NAME']
CSV_FILE_NAME = os.environ['CSV_FILE_NAME']

def read_csv_from_s3():
    try:
        print(f"Attempting to read file: {CSV_FILE_NAME} from bucket: {BUCKET_NAME}")
        response = s3.get_object(Bucket=BUCKET_NAME, Key=CSV_FILE_NAME)
        csv_content = response['Body'].read().decode('utf-8')
        return csv_content
    except Exception as e:
        print(f"Error reading CSV from S3: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise

def process_csv_content(csv_content):
    category_counter = defaultdict(int)
    csv_reader = csv.DictReader(StringIO(csv_content))
    for row in csv_reader:
        if 'Category' in row:
            category = row['Category'].strip()
            if category.lower() != 'category':
                category_counter[category] += 1
    return [{"category": category, "count": count} for category, count in category_counter.items()]

def get_csv_data():
    try:
        csv_content = read_csv_from_s3()
        csv_reader = csv.DictReader(StringIO(csv_content))
        return [{"intent": row.get("Original Text", ""), "category": row.get("Category", "")} for row in csv_reader]
    except Exception as e:
        print(f"Error in get_csv_data: {str(e)}")
        print(traceback.format_exc())
        return []
    
def handle_get_intents():
    try:
        csv_content = read_csv_from_s3()
        categories = process_csv_content(csv_content)
        return {
            'statusCode': 200,
            'body': json.dumps({'categories': categories}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        }
    except Exception as e:
        print(f"Error in handle_get_intents: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error retrieving normalized intents',
                'error': str(e)
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        }

def handle_get_csv_data():
    try:
        csv_data = get_csv_data()
        return {
            'statusCode': 200,
            'body': json.dumps({'csv_data': csv_data}),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        }
    except Exception as e:
        print(f"Error in handle_get_csv_data: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error retrieving CSV data',
                'error': str(e)
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        }

def handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        http_method = event['httpMethod']
        resource = event['resource']
        
        if http_method == 'GET' and resource == '/intents':
            return handle_get_intents()
        elif http_method == 'GET' and resource == '/data':
            return handle_get_csv_data()
        elif http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'body': json.dumps('OK'),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                }
            }
        else:
            return {
                'statusCode': 405,
                'body': json.dumps({'message': 'Method not allowed'}),
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                }
            }
    except Exception as e:
        print(f"Error in handler: {str(e)}")
        print(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing request',
                'error': str(e)
            }),
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            }
        }