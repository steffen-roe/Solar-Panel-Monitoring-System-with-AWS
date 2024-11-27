import json
import requests
import boto3
import logging
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time

# Set up logging configuration
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB configuration
dynamodb = boto3.resource('dynamodb', region_name='eu-central-1')
dynamodb_table = dynamodb.Table('solarData1')

def lambda_handler(event, context):
    url = 'https://pvoutput.org/intraday.jsp?id=50549&sid=45989'
    
    try:
        # Fetch the HTML content
        response = requests.get(url, timeout=15)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract the first row of the table
        table = soup.find("table", {"id": "tb"})
        first_row = table.find("tr", {"class": "e"})
        
        # Columns to extract from the first row
        columns_to_extract = [0, 1, 2, 4, 7]
        scraped_data = [
            cell.get_text(strip=True)
            for index, cell in enumerate(first_row.find_all("td"))
            if index in columns_to_extract
        ]
        
        # Process the scraped data
        current_time = datetime.now() + timedelta(hours=1)
        in_time = datetime.strptime(scraped_data[1], "%I:%M%p")
        out_time = in_time.strftime("%H:%M")

        energy_value = scraped_data[2].replace("kWh", "").strip()
        power_value = scraped_data[3].replace("W", "").replace(",", "").strip()
        temperature_value = scraped_data[4].replace("C", "").strip()

        # Compare time and decide whether to store the data
        if current_time.strftime("%H") == out_time[:2]:
            # Prepare data for DynamoDB
            item = {
                'time': out_time,
                'energy': energy_value,
                'power': power_value,
                'temperature': temperature_value,
                'day': datetime.now().strftime("%d"),
                'expireAt': int(time.time()) + 604800  # Data expires after one week
            }

            # Store data in DynamoDB
            response_ddb = dynamodb_table.put_item(Item=item)
            logger.info(f"Successfully sent data to DynamoDB: {response_ddb}")
        else:
            logger.warning(f"Data time ({out_time[:2]}) does not match current hour ({current_time.strftime('%H')})")

        # Return response
        return {
            'statusCode': 200,
            'body': json.dumps("Successfully scraped and sent to DynamoDB")
        }

    except requests.RequestException as e:
        # Handle network-related errors
        logger.error(f"Network error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({"error": f"Network error: {str(e)}"})
        }
    except Exception as e:
        # Handle unexpected errors
        logger.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({"error": f"Unexpected error: {str(e)}"})
        }
