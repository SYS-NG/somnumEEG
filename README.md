# EEG Monitoring Web Application with Muse2 Headband

## Overview

This web application serves as a capstone project designed to monitor EEG readings from a Muse2 headband using the Muse-js SDK. The application establishes a connection to the Muse2 headband through web Bluetooth and then uploads the collected EEG data into a MongoDB database for further analysis.

## Features

- **Bluetooth Connectivity**: Utilizes the Muse-js SDK to establish a connection with the Muse2 headband through web Bluetooth.

- **Real-time EEG Monitoring**: Displays real-time EEG readings from the Muse2 headband, providing a live visualization of brainwave activity.

- **MongoDB Integration**: Stores EEG data in a MongoDB database, enabling data persistence for later analysis and insights.

- **User-friendly Interface**: The application is designed with a clean and intuitive user interface for ease of use.

## Getting Started

### Prerequisites

Make sure you have the following installed before running the application:

- Node.js: [Download and Install Node.js](https://nodejs.org/)

### Installation

1. Clone the repository:

 ```bash
 git clone https://github.com/SYS-NG/somnumEEG.git
 ```
   
2. Navigate to the project directory:

```bash
cd eeg-monitoring-app
```

3. Install dependencies:

```bash
npm install
```

4. Start the application and server:
```bash
npm run start
node backend/server.js
```

- Open your web browser and navigate to http://localhost:3000 to access the EEG monitoring interface.
- The server should be running on https://localhost:5000

5. Add mongoDB URI:
- Add a `.env.` file in the project directory with your mongoDB Server URI:
```bash
SERVER_MONGODB_URI="<add_your_uri_here>"
```
Acknowledgments
Muse-js SDK: The JavaScript library for interacting with Muse headbands.

MongoDB: The NoSQL database used for storing EEG data.

The open-source community provides valuable resources and support.
