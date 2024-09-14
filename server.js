const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
require('firebase/auth');

const app = express();

// Initialize Firebase Admin SDK
const accountDetails = require('./movie-d5ce0-firebase-adminsdk-9ju63-fe9e38655a.json');
admin.initializeApp({
  credential: admin.credential.cert(accountDetails),
});

const db = admin.firestore();

// Initialize Firebase Web SDK
const firebaseConfig = {
  apiKey: "AIzaSyCSJX1AIYdj9NevFRRstpKd_SqU9dbe22k",
  authDomain: "movie-d5ce0.firebaseapp.com",
  projectId: "movie-d5ce0",
  storageBucket: "movie-d5ce0.appspot.com",
  messagingSenderId: "200820086558",
  appId: "1:200820086558:web:68811116734474a79e1b0f",
};
firebase.initializeApp(firebaseConfig);

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (like HTML) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Route to handle signup form submission
app.post('/signup', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Create user with Firebase Auth
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save user details in Firestore
    await db.collection('users').doc(user.uid).set({
      name: name,
      email: email,
      uid: user.uid,
    });
    
    res.send('User created successfully. <a href="/login.html">Login</a>');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error creating user');
  }
});

// Route to display login form (if needed)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Route to handle login form submission     
app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    // Sign in user with Firebase Auth
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Retrieve user data from Firestore
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      res.send('User does not exist. <a href="/login.html">Try again</a>');
      return;
    }

    const userData = userDoc.data();
    res.send(`Welcome, ${userData.name}. <a href="/">Go to homepage</a>`);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error logging in');
  }
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
