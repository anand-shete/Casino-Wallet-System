# Casino Wallet System

A simulated crypto casino backend supporting BTC, ETH, SOL, and DOGE. Handles user registration, wallet management, and game logic using fake wallets and mock transactions—ideal for testing or educational purposes without real blockchain integration.

## Features

- **User Registration and Authentication** : Register users and store credentials securely using hashed passwords.
- **Fake Wallet Assignment** : Each user is assigned unique fake wallet addresses for BTC, ETH, SOL and DOGE.
- **Deposit Simulation** : Users can simulate depositing crypto in their wallet using their wallet addresses.
- **Withdrawl Simulation** : Real-time tracking of balances for each cryptocurrency per user.
- **Casino Game** : A simple game mechanic randomly returns "won" or "lost".
- **Vitest** : Used Vitest for efficient testing of all the backend endpoints.

## Installation Setup

1. Clone the Repository
   ```
   git clone https://github.com/anand-shete/Casino-Wallet-System
   cd Casino-Wallet-System
   ```
2. Install dependencies for both `frontend` and `backend` directories:
   ```
   cd frontend
   npm install
   cd ../backend
   npm install
   ```
3. Set up environment variables:
   Rename the `.env.example` to `.env` in the backend directory:

   ```
   MONGO_URI = mongodb://localhost:27017/casino-wallet-system
   PORT = 3000

   JWT_SECRET = your_JWT_SECRET
   ```

4. Start the `server.js` and `frontend`
   For `backend` directory:
   ```
   cd ./backend
   npm run dev
   ```
   For `frontend` directory, create a new terminal:
   ```
   cd ./frontend
   npm run dev
   ```

## Testing

Vitest has been used for testing critical components. To pass all the tests, follow these steps:

1. Navigate to the `/tests` directory:
   ```
   cd ./tests
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Rename the `.env.example` to `.env` and add these variables:
   ```
   JWT_SECRET = your_JWT_SECRET
   ```
4. Start the backend server (If not already started) inside a new terminal session:
   ```
   cd ../backend
   npm run dev
   ```
5. Run the Tests
   ```
   npm run test
   ```
   You should be able to pass all the 6 tests

## API Documentation

- POST `/register` - Register a User and create wallet addresses  
  Request:

  ```
  { username:"Anand" , password:"123"}
  ```

  Response: returns status 200

  ```
  {
    message:"User Registered Successfully"
    username: "Anand"
  }
  ```

- POST `/deposit` - Deposit User's Cash into his account  
  Request:
  ```
  {
    amount: 10,
    address: "bc170a3a6a477b4d8fc5ae9777800a1444d67",
    cryptocurrency: BTC
  }
  ```
  Response: Returns `200`
  ```
  {
    message:"Deposited 10 BTC in Account,
    balance: { BTC: 10, ETH:0, SOL: 0, DOGE:0 }
  }
  ```
- POST `/play` - Win function that lets user win on 50% probability.  
  Request:

  ```
  {
    wager:10,
    cryptocurrency: BTC
  }
  ```

  Response: returns `200`

  ```
  {
    message: amount > 0 ? "You Won this Round!" : "You Lost this Round!",
    balance: { BTC: 10, ETH:0, SOL: 0, DOGE:0 }
  }

  ```

- POST `/withdraw` - Withdraw money from your account to Payment Gateway.  
  Request:

  ```
  {
    amount: 10,
    cryptocurrency: BTC,
    address:"bc170a3a6a477b4d8fc5ae9777800a1444d67"
  }
  ```

  Response: retuns `200`, `404`

  ```
  {
    message: "Insufficient balance",
    balance: { BTC:0, ETH:5, SOL: 10, DOGE: 100 } ,
    casinoBal: { BTC:1, ETH:10, SOL: 100, DOGE: 1000 }
  }
  ```

- GET `/balance` - Get balance of a User.  
  Request:
  ```
  {}
  ```
  Response: retuns `200`
  ```
  {
    message: "Balance fetched successsfully",
    balance: { BTC:0, ETH:5, SOL: 10, DOGE: 100 },
    address: { BTC:"bc170a3a6a477b4d8fc5ae9777800a1444d67", ETH:"0x4e874d006af02d6f573235ef51438cdff5b29f64", SOL:"Qh4WgGU9J4VeU5Yd2e58db5J19CiSB315LVe8CRUTGP" , DOGE:"D6b98fc878f70d90a7189b73c459e40" },
  }
  ```

## Database Schema

User schema

```
{
  username: { type: String, required: true },
  password: { type: String, required: true },
  balance: {
    BTC: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    SOL: { type: Number, default: 0 },
    DOGE: { type: Number, default: 0 },
  },
  address: {
    BTC: { type: String, required: true },
    ETH: { type: String, required: true },
    SOL: { type: String, required: true },
    DOGE: { type: String, required: true },
  },
}
```

Transaction Schema

```
{
  username: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, enum: ["deposit", "withdrawal", "result"], required: true },
  amount: { type: Number },
  result: { type: String, enum: ["won", "lost"] },
}
```
