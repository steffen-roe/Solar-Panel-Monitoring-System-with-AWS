# Serverless Solar-Panel-Monitoring-System-with-AWS
After I got familiar with core AWS services like EC2, VPCs, subnets, and more, I decided to work on my first project to gain hands-on experience in this new environment. This repository documents the goal, the key components, and implementation of that project: a serverless monitoring system for solar panel installations.
It features a web application designed to monitor and visualize real-time and historical solar panel output data, leveraging AWS services for the backend and a React frontend for data visualization.
The initial plan was to extract solar panel data directly from our home installation. However, this proved challenging due to a missing gateway for data retrieval and the limitations of an outdated user application. As an alternative, I chose to scrape live data from the website https://pvoutput.org/, where users publicly share and compare their solar energy generation metrics. 

![alt text](https://github.com/steffen-roe/Solar-Panel-Monitoring-System-with-AWS/blob/6992e1138e3805260a4f96da09f79ad613f83d2e/dashboard.png)

## Features
- Real-time data visualization of solar panel output
- Historical data filtering by date and predefined ranges
- Serverless backend powered by AWS

## Architecture Diagram
![Architecture Diagram](https://github.com/steffen-roe/Solar-Panel-Monitoring-System-with-AWS/blob/5c4dde6fd876a5ee887530eb7c58a4858f3a5081/architecture_diagram.png)

## Key Components - Backend

### DynamoDB
AWS DynamoDB was used to store and manage real-time daily solar panel output data efficiently. Its key-value structure is ideal for organizing time-series data, such as power output, panel temperature, and timestamps. With its low-latency performance and automatic scaling, DynamoDB ensures fast, reliable access to data for live visualization. Additional features like TTL (Time-to-Live) help manage data retention by automatically expiring older records, keeping the system lightweight and optimized. In addition, DynamoDB is fully managed by AWS and, therefore, fits seamlessly into serverless workflows, such as those using AWS Lambda.

---

### Simple Storage Service (S3)
To maintain cost efficiency, data that does not require frequent or fast access is periodically archived to an AWS S3 bucket. The bucket is organized using a logical structure based on year and month, making it easy to retrieve historical data when needed. This approach reduces DynamoDB storage costs while leveraging S3's low-cost storage solution for infrequently accessed data, such as long-term performance trends or older solar panel metrics.

---

### Lambda Functions

The backend logic of the solar panel monitoring system is implemented using multiple AWS Lambda functions. These functions handle data scraping, processing, storage, and retrieval tasks. Below are the key Lambda functions and their roles:

#### 1. **Data Scraper Function**
- **Purpose**: Periodically scrapes live solar panel data from a specified website and stores it in DynamoDB.
- **Details**:
  - Extracts key metrics such as time, energy, power, and panel temperature from the website using BeautifulSoup.
  - Ensures the data is only stored if the scraped time matches the current hour.
  - Adds an `expireAt` attribute to DynamoDB items to ensure data is automatically deleted after one week.

#### 2. **Data Archiver Function**
- **Purpose**: Archives daily data from DynamoDB into Amazon S3 for long-term storage in JSON format.
- **Details**:
  - Queries DynamoDB for data collected on the current day.
  - Stores the data in an S3 bucket with a hierarchical folder structure (`year/month/day.json`) for easy organization.
  - Ensures data availability for historical analysis while optimizing DynamoDB costs.

#### 3. **Data Retrieval and API Handler Function**
- **Purpose**: Responds to API Gateway requests to fetch solar panel data based on user-specified ranges or dates.
- **Details**:
  - Supports the following query ranges:
    - **Daily**: Retrieves data from DynamoDB for the current day.
    - **Weekly/Monthly**: Fetches maximum energy values from archived S3 data for the past 7 or 30 days.
    - **Specific Date**: Retrieves archived data from S3 for a user-specified date in `YYYYMMDD` format.
  - Includes CORS preflight response handling for secure cross-origin API access.

#### Technologies Used
- **Programming Language**: Python
- **AWS Services**: Lambda, DynamoDB, S3, API Gateway
- **Libraries and Tools**: BeautifulSoup (for web scraping), Boto3 (for AWS interactions), `datetime` and `time` modules (for time handling), robust logging.

---

### API Gateway

AWS API Gateway is used to expose HTTP endpoints that connect the front-end application with the back-end services, allowing it to trigger Lambda functions to fetch data from DynamoDB and S3. It is configured with Cross-Origin Resource Sharing (CORS) to allow the React front-end to make requests without security issues. The flow goes as follows: The front-end React application makes a request to the API Gateway (GET /solar-data). The API Gateway then routes the request to the corresponding Lambda function, which in turn processes the request, queries DynamoDB or the S3 bucket for solar panel data, and returns it to the API Gateway. Finally, the API Gateway sends the processed response back to the front-end.

---



### Frontend
