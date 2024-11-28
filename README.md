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
### DynamoDB
DynamoDB was chosen as the primary storage solution for live data due to its ability to handle real-time data retrieval and updates efficiently.
