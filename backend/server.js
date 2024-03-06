const express    = require("express");
const bodyParser = require('body-parser')
const DataModel  = require("./DataModel")
const connectDB  = require("./Database");
connectDB();

const app = express();
app.use(express.json({ extended: false }));

//we need cors middleware here because frontend and backend run on different ports.
const cors = require("cors");
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }))

app.post("/bulkWrite", async (req, res) => {
  console.log("Bulk write request received, ", "Data length: ", req.body.length);
  try {
    console.log("try to insert: ", req.body.length, " records");
    await DataModel.insertMany(req.body);
    res.json({message: "Data saved successfully"})
    console.log("Data saved successfully");
  } catch (error) {
    console.log("Error in bulkWrite", error.message);
    res.status(500).send("Server error while saving data")
  }
})

app.post("/writetodatabase", async (req, res) => {
  try {
    const {content} = req.body;
    const newData = new DataModel({ 
      deviceName: content.deviceName,
      eegChannel: content.eegChannel,
      eegData:    content.eegData
    });
    await newData.save();
    res.json({message: "Data saved successfully"})
    console.log("Data saved successfully");
  } catch (error) {
    console.log("Error", error.message);
    res.status(500).send("Server error while saving data")
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on PORT: ${PORT}`);
})