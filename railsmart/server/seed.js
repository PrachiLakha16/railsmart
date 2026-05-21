const mongoose = require('mongoose')
const Train = require('./models/Train')
const trains = require('./data/trains')
require('dotenv').config()

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected!')

    // Clear existing trains
    await Train.deleteMany({})
    console.log('Old trains cleared!')

    // Insert new trains
    await Train.insertMany(trains)
    console.log(`${trains.length} trains inserted successfully!`)

    mongoose.connection.close()
    console.log('Done!')

  } catch (error) {
    console.log('Error:', error.message)
    process.exit(1)
  }
}

seedDB()