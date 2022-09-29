const mongoose = require('mongoose');

const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });
// console.log(process);
const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successfully'));

// //Creating a document and testing
// const testTour = new Tour({
//   name: 'The Lake Hiker',
//   price: 667,
//   rating: 5.7,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//starting the server
const port = process.env.PORT; //port number

app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});
