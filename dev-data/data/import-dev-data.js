const mongoose = require('mongoose');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('../../Models/tourModel');

dotenv.config({ path: './config.env' });
// console.log(process);
const DB = process.env.DATABASE_LOCAL;

//fs.---returns json so we need to parse it as a object instead
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successfully'));

//import DATA on Db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('DB successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//delete all DATA on Db
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('DB successfully deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
