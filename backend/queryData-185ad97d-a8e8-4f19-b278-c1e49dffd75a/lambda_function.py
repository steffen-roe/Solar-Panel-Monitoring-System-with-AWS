import boto3
from boto3.dynamodb.conditions import Key
import json
from datetime import datetime, timedelta

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')

# Table and bucket configurations
TABLE_NAME = 'solarData1'
BUCKET_NAME = 'solar-data-1'

def lambda_handler(event, context):
    """Handles incoming requests to fetch solar data based on the range parameter."""
    
    # Handle OPTIONS request (CORS pre-flight)
    if event['httpMethod'] == 'OPTIONS':
        return build_cors_response()

    # Extract range parameter from the query string
    range_param = event.get('queryStringParameters', {}).get('range', None)
    current_day = datetime.now().strftime("%d")

    # Access DynamoDB table
    table_ddb = dynamodb.Table(TABLE_NAME)

    # Process the range parameter and fetch appropriate data
    if range_param == 'day':
        items = get_daily_data(table_ddb, current_day)
    elif range_param == '7':
        items = get_energy_max(7)
    elif range_param == "30":
        items = get_energy_max(30)
    elif is_valid_date_format(range_param):
        items = get_data_from_s3(range_param)
    else:
        return build_error_response('Invalid range parameter.')

    # Return the response with the fetched data
    return build_success_response(items)

def build_cors_response():
    """Builds the CORS response for OPTIONS requests."""
    return {
        "statusCode": 204,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # Allow all origins
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",  # Allowed methods
            "Access-Control-Allow-Headers": "Content-Type",  # Allowed headers
        },
        "body": None  # OPTIONS requests do not return a body
    }

def build_success_response(items):
    """Builds a successful response with fetched items."""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        'body': json.dumps(items)
    }

def build_error_response(message):
    """Builds an error response with a given message."""
    return {
        'statusCode': 400,
        'body': json.dumps({'message': message})
    }

def get_daily_data(table_ddb, current_day):
    """Fetches the daily data from DynamoDB for the current day."""
    response = table_ddb.query(
        KeyConditionExpression=Key('day').eq(current_day),
        ProjectionExpression="#time, power, energy",  # Alias for reserved 'time'
        ExpressionAttributeNames={
            "#time": "time"
        },
        ScanIndexForward=True
    )
    return response['Items']

def is_valid_date_format(range_param):
    """Checks if the provided date is in 'YYYYMMDD' format."""
    try:
        datetime.strptime(range_param, '%Y%m%d')
        return True
    except (ValueError, TypeError):
        return False

def get_data_from_s3(range_param):
    """Fetches data from S3 for a specific date in 'YYYYMMDD' format."""
    parsed_date = datetime.strptime(range_param, '%Y%m%d')
    key = parsed_date.strftime('%Y/%m')
    key1 = parsed_date.strftime('%Y_%m_%d.json')
    
    response = s3.get_object(
        Bucket=BUCKET_NAME,
        Key=f"{key}/{key1}"
    )
    
    items = response['Body'].read().decode('utf-8')
    return json.loads(items)

def get_energy_max(span):
    """Fetches the maximum energy for the last 'span' number of days from S3."""
    today = datetime.now()
    energy_max = []

    for i in range(span):
        current_date = today - timedelta(days=(i+1))
        s3_key = current_date.strftime('%Y/%m') + '/' + current_date.strftime('%Y_%m_%d.json')
        
        # Fetch data from S3
        response = s3.get_object(
            Bucket=BUCKET_NAME,
            Key=s3_key
        )
        items = response['Body'].read().decode('utf-8')
        items = json.loads(items)

        # Find the highest energy value for the day
        energy_max.append({
            'date': current_date.strftime('%Y-%m-%d'),
            'max_energy': max(float(item["energy"]) for item in items)
        })

    # Sort the data by date and return
    return sorted(energy_max, key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))
