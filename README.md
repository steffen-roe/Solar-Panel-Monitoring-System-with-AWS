# Serverless Solar-Panel-Monitoring-System-with-AWS
After I got familiar with core AWS services like EC2, VPCs, subnets, and more, I decided to work on my first project to gain hands-on experience in this new environment. This repository documents the goal, the key components, and implementation of that project: a serverless monitoring system for solar panel installations.

It features a web application designed to monitor and visualize real-time and historical solar panel output data, leveraging AWS services for the backend and a React frontend for data visualization.

![alt text](https://github.com/steffen-roe/Solar-Panel-Monitoring-System-with-AWS/blob/6992e1138e3805260a4f96da09f79ad613f83d2e/dashboard.png)

## Features
- Real-time data visualization of solar panel output
- Historical data filtering by date and predefined ranges
- Serverless backend powered by AWS

## Architecture Diagram
![Architecture Diagram](https://github.com/steffen-roe/Solar-Panel-Monitoring-System-with-AWS/blob/5c4dde6fd876a5ee887530eb7c58a4858f3a5081/architecture_diagram.png)

## Key Components
1. **React Frontend**: User interface for data visualization.
2. **AWS Lambda**: Backend logic and data processing.
3. **API Gateway**: Exposes backend APIs to the frontend.
4. **DynamoDB**: Stores live solar panel data.
5. **S3**: Hosts the React frontend and stores historical data.
