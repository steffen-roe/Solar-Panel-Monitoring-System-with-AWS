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

## Key Components

### Backend
#### DynamoDB
DynamoDB was used to store and manage real-time daily solar panel output data efficiently. Its key-value structure is ideal for organizing time-series data, such as power output, panel temperature, and timestamps. With its low-latency performance and automatic scaling, DynamoDB ensures fast, reliable access to data for live visualization. Additional features like TTL (Time-to-Live) help manage data retention by automatically expiring older records, keeping the system lightweight and optimized. In addition, DynamoDB is fully managed by AWS and, therefore, fits seamlessly into serverless workflows, such as those using AWS Lambda.

#### Simple Storage Service (S3)
To maintain cost efficiency, data that does not require frequent or fast access is periodically archived to an S3 bucket. The bucket is organized using a logical structure based on year and month, making it easy to retrieve historical data when needed. This approach reduces DynamoDB storage costs while leveraging S3's low-cost storage solution for infrequently accessed data, such as long-term performance trends or older solar panel metrics.

### Frontend
