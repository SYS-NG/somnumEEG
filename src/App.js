import logo from './assets/somnum_logo_only.png';
import './App.css';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const { channelNames, MuseClient } = require('muse-js');

const firebaseConfig = {
  apiKey: "AIzaSyD",
  authDomain: "somnum-3e7e7.firebaseapp.com",
  projectId: "somnum-3e7e7",
  storageBucket: "somnum-3e7e7.appspot.com",
  messagingSenderId: "1042",
  appId: "1:1042",
};

const firebaseApp = initializeApp(firebaseConfig);
const db          = getFirestore(firebaseApp);

function App() {
  const electrodeNames = {
    'TP9':  'Left Ear',
    'AF7':  'Left Forehead',
    'AF8':  'Right Forehead',
    'TP10': 'Right Ear',
  };

  const connect = async () => {
    const graphTitles = Array.from(document.querySelectorAll('.electrode-item h3'));
    const canvases = Array.from(document.querySelectorAll('.electrode-item canvas'));
    const canvasCtx = canvases.map((canvas) => canvas.getContext('2d'));

    graphTitles.forEach((item, index) => {
        const channelName  = channelNames[index];
        const channelTitle = channelName in electrodeNames ? channelName + ' - ' + electrodeNames[channelName] : channelName; 
        item.textContent   = channelTitle;
    });

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
    <div className="App">
      <header className="App-header">
        <div className='Page'>
          <div className='connect-section'>
            <img src={logo} className="App-logo" alt="logo" />
            <button className="connect-button" onClick={connect}>Connect</button>
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

          <div class="electrode-section">
              <div class="electrode-container">
                <div class="electrode-item">
                    <h3>Electrode 1</h3>
                    <canvas id="electrode1"></canvas>
                </div>
                <div class="electrode-item">
                    <h3>Electrode 2</h3>
                    <canvas id="electrode2"></canvas>
                </div>
              </div>
              <div class="electrode-container">
                <div class="electrode-item">
                    <h3>Electrode 3</h3>
                    <canvas id="electrode3"></canvas>
                </div>

                <div class="electrode-item">
                    <h3>Electrode 4</h3>
                    <canvas id="electrode4"></canvas>
                </div>
                <div class="electrode-item">
                    <h3>Electrode 5</h3>
                    <canvas id="electrode5"></canvas>
                </div>
              </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
