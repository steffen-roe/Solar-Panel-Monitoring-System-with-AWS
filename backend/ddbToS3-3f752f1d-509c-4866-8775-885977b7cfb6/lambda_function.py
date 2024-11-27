import json
import boto3
from datetime import datetime
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    """
    Lambda function to query solar data from DynamoDB and export it to an S3 bucket
    as a JSON file named with the current date.
    
    Args:
        event (dict): The event data passed by the triggering service.
        context (object): The Lambda context object containing runtime information.
        
    Returns:
        dict: A response dictionary with HTTP status and message.
    """
    
    # Initialize AWS services
    dynamodb = boto3.resource('dynamodb')
    s3 = boto3.client('s3')

    # Define constants
    DYNAMO_TABLE_NAME = 'solarData1'
    S3_BUCKET_NAME = 'solar-data-1'

    # Get the current date for file naming
    current_date = datetime.now()
    current_day = current_date.strftime("%d")
    file_name = f"{current_date.strftime('%Y_%m_%d')}.json"
    
    # Access DynamoDB table
    table = dynamodb.Table(DYNAMO_TABLE_NAME)

    try:
        # Query DynamoDB to get data for the current day
        response = table.query(
            KeyConditionExpression=Key('day').eq(current_day),
            ProjectionExpression="#time, power, energy, temperature",  # Alias for reserved 'time'
            ExpressionAttributeNames={
                "#time": "time"  
            },
        )
        data = response.get('Items', [])

        if not data:
            raise ValueError("No data found for the current day.")

        # Convert data to JSON
        json_data = json.dumps(data)

        # Define the S3 object path (folder structure by year/month)
        s3_key = f"{current_date.strftime('%Y')}/{current_date.strftime('%m')}/{file_name}"

        # Upload the JSON data to S3
        s3.put_object(
            Bucket=S3_BUCKET_NAME,
            Key=s3_key,
            Body=json_data
        )

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps('Data successfully exported to S3')
        }

    except Exception as e:
        # Log the exception and return an error response
        print(f"Error occurred: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error occurred: {str(e)}")
        }
