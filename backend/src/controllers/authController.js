const admin = require('firebase-admin');
const axios = require('axios');

// Create a new user (Signup)
exports.signup = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!admin.apps.length) {
       return res.status(500).json({ error: 'Firebase Admin not initialized. Please check backend credentials.' });
    }

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
};

// Login user (verify via Firebase Identity Toolkit REST API)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const API_KEY = process.env.FIREBASE_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'FIREBASE_API_KEY is not configured on the backend.' });
    }

    // Use Firebase REST API to sign in with email and password
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, localId, refreshToken, expiresIn } = response.data;

    res.status(200).json({
      message: 'Login successful',
      token: idToken,
      refreshToken,
      expiresIn,
      user: {
        uid: localId,
        email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.response?.data?.error?.message || error.message);
    const errorMessage = error.response?.data?.error?.message || 'Invalid credentials';
    res.status(401).json({ error: errorMessage });
  }
};
// Verify Firebase ID Token (for Social/Phone Login)
exports.verifyToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture, phone_number } = decodedToken;

    res.status(200).json({
      message: 'Token verified successfully',
      user: {
        uid,
        email: email || null,
        displayName: name || null,
        photoURL: picture || null,
        phoneNumber: phone_number || null,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
