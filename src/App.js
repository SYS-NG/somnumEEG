import {BrowserRouter as Router} from "react-router-dom";
import React, {useState, useEffect} from 'react';
import logo from './assets/somnum_logo_only.png';
import './App.css';
import axios from "axios";
const { channelNames, MuseClient } = require('muse-js');

// Try useEffect that changes subscriber

function App() {

  // Usestate to control when to write data to database
  const [shouldWriteToDB, setShouldWriteToDB] = useState(false);
  const [collectedData, setCollectedData] = useState([{}]);
  const [doUploadData, setDoUploadData] = useState(false);

  const electrodeNames = {
    'TP9':  'Left Ear',
    'AF7':  'Left Forehead',
    'AF8':  'Right Forehead',
    'TP10': 'Right Ear',
  };

  const collectData = (deviceName, reading) => {
    // console.log(shouldWriteToDB);
    // if (shouldWriteToDB)
    //   writeToDatabase(deviceName, reading);
    // }
    console.log("collect data")
    setCollectedData(prevData => [
    ...prevData,
    {
      timestamp:  reading.timestamp,
      eegData:    reading.samples,
      deviceName: deviceName,
      eegChannel: reading.electrode,
    }
    ])
  }

  // const writeToDatabase = async(deviceName, reading) => {
  //   const apiUrl = 'http://localhost:5000/writetodatabase';
  //   try {
  //     await axios.post(apiUrl,
  //       {
  //         content: {
  //         eegData: reading.samples,
  //         deviceName: deviceName,
  //         eegChannel: reading.electrode,
  //         }
  //       }
  //     );
  //     // console.log("Data: ", deviceName, reading.samples);
  //   } catch (error) {
  //     console.log("error while saving dude: ", error.message);
  //   }
  // }

  const bulkWriteToDatabase = async(req) => {
    // get number of bytes in req
    console.log("byte size of req: ", JSON.stringify(req).length);
    console.log("req length: ", req.length)
    const apiUrl = 'http://localhost:5000/bulkWrite';
    const chunkSize = 200;
    try {
      console.log("bulk writing to database");
      // Split insertMany into smaller chunks to avoid exceeding the 16MB limit, 500 at a time
      for (let i = 0; i < req.length; i += chunkSize) {
        let data = req.slice(i, i + chunkSize);
        await axios.post(apiUrl, data);
      }

    } catch (error) {
      console.log("error while saving dude: ", error.message);
    }
  } 

  useEffect(() => {
    if (doUploadData) {
      console.log("uploading data");
      bulkWriteToDatabase(collectedData);
      setDoUploadData(false);
      setCollectedData([]);
    }
  }, [doUploadData]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if ((!shouldWriteToDB && collectedData.length > 0)) {
      setDoUploadData(true);
    }
    else {setCollectedData([]);}
  }, [shouldWriteToDB]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = () => {
    setShouldWriteToDB(prevState => !prevState);
  }

  const connect = async () => {
    console.log("start of connect", shouldWriteToDB);
    const graphTitles = Array.from(document.querySelectorAll('.electrode-item h3'));
    const canvases = Array.from(document.querySelectorAll('.electrode-item canvas'));
    const canvasCtx = canvases.map((canvas) => canvas.getContext('2d'));

    graphTitles.forEach((item, index) => {
        const channelName  = channelNames[index];
        const channelTitle = channelName in electrodeNames ? channelName + ' - ' + electrodeNames[channelName] : channelName; 
        item.textContent   = channelTitle;
    });
    
    // Might move to use API without server in the future
    // const writeToDatabase_api = async(deviceName, reading) => {
    //   const data = {
    //     timestamp:  reading.timestamp,
    //     eegData:    reading.samples,
    //     deviceName: deviceName,
    //     eegChannel: reading.electrode,
    //   }
    //   var config = {
    //       method: 'post',
    //       url: 'https://us-west-2.aws.data.mongodb-api.com/app/data-uzqwg/endpoint/data/v1/action/findOne',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Access-Control-Request-Headers': '*',
    //         'api-key': '',
    //       },
    //       data: data
    //   };
    //               
    //   axios(config)
    //       .then(function (response) {
    //         console.log(response);
    //         console.log(JSON.stringify(response.data));
    //       })
    //       .catch(function (error) {
    //           console.log(error);
    //       });
    // }

    function plot(reading) {
        const canvas = canvases[reading.electrode];
        const context = canvasCtx[reading.electrode];
        if (!context) {
            return;
        }
        const width = canvas.width / 12.0;
        const height = canvas.height / 2.0;
        context.fillStyle = 'green';
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < reading.samples.length; i++) {
            const sample = reading.samples[i] / 15.0;
            if (sample > 0) {
                context.fillRect(i * 25, height - sample, width, sample);
            } else {
                context.fillRect(i * 25, height, width, -sample);
            }
        }
    }

    const client = new MuseClient();
    client.connectionStatus.subscribe((status) => {
        console.log(status ? 'Connected!' : 'Disconnected');
    });

    try {
      client.enableAux = true;
      await client.connect();
      await client.start();
      document.getElementById('headset-name').innerText = client.deviceName;
      client.eegReadings.subscribe((reading) => {
          collectData(client.deviceName, reading);
          plot(reading);
      });
      client.telemetryData.subscribe((reading) => {
          document.getElementById('temperature').innerText = reading.temperature.toString() + '℃';
          document.getElementById('batteryLevel').innerText = reading.batteryLevel.toFixed(2) + '%';
      });
        client.accelerometerData.subscribe((accel) => {
            const normalize = (v) => (v / 16384.0).toFixed(2) + 'g';
            document.getElementById('accelerometer-x').innerText = normalize(accel.samples[2].x);
            document.getElementById('accelerometer-y').innerText = normalize(accel.samples[2].y);
            document.getElementById('accelerometer-z').innerText = normalize(accel.samples[2].z);
        });
        await client.deviceInfo().then((deviceInfo) => {
            document.getElementById('hardware-version').innerText = deviceInfo.hw;
            document.getElementById('firmware-version').innerText = deviceInfo.fw;
        });
    } catch (err) {
        console.error('Connection failed', err);
    }
  };  

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className='Page'>
            <div className='connect-section'>
              <img src={logo} className="App-logo" alt="logo" />
              <div className="buttons-container">
                <button className="connect-button" onClick={connect}>Connect</button>
                <button className="record-button" onClick={toggle}>
                  {shouldWriteToDB? '🔴 Recording' : '▶️ Start Recording'}
                </button>
              </div>
              <div>
                  Name: <span id="headset-name">unknown</span><br/>
                  Firmware: <span id="firmware-version">unknown</span><br/>
                  Hardware version: <span id="hardware-version">unknown</span><br/>
                  Temperature: <span id="temperature">unknown</span><br/>
                  Battery: <span id="batteryLevel">unknown</span><br/>
                  Accelerometer:<br/>
                  __x=<span id="accelerometer-x">?</span>,<br/>
                  __y=<span id="accelerometer-y">?</span>,<br/>
                  __z=<span id="accelerometer-z">?</span>
              </div>
            </div>

            <div className="electrode-section">
                <div className="electrode-container">
                  <div className="electrode-item">
                      <h3>Electrode 1</h3>
                      <canvas id="electrode1"></canvas>
                  </div>
                  <div className="electrode-item">
                      <h3>Electrode 2</h3>
                      <canvas id="electrode2"></canvas>
                  </div>
                </div>
                <div className="electrode-container">
                  <div className="electrode-item">
                      <h3>Electrode 3</h3>
                      <canvas id="electrode3"></canvas>
                  </div>

                  <div className="electrode-item">
                      <h3>Electrode 4</h3>
                      <canvas id="electrode4"></canvas>
                  </div>
                  <div className="electrode-item">
                      <h3>Electrode 5</h3>
                      <canvas id="electrode5"></canvas>
                  </div>
                </div>
            </div>
          </div>
        </header>
      </div>
    </Router>
  );
}

export default App;
