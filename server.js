const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
var regsiterToken;
var authToken;
// Middleware to parse JSON bodies
app.use(express.json());

// Constants
const WINDOW_SIZE = 10;
let numbers = [];

// Function to calculate average of an array
const calculateAverage = (arr) => {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((acc, num) => acc + num, 0);
    return sum / arr.length;
};

// GET endpoint handler
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;

    let url = "http://20.244.56.144/test/register";

    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

            "companyName": "Affordmed",
            "ownerName": "Parkavi V",
            "rollNo": "113021104077",
            "ownerEmail": "parkaviv_cse21@velhightech.com",
            "accessCode": "yqlhcX"
        })
    })
        .then(response => response.json())
        .then(response => regsiterToken = response)

    let authURL = "http://20.244.56.144/test/auth";

    fetch(authURL, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

            "companyName": "Affordmed",
            "ownerName": regsiterToken.clientID,
            "rollNo": regsiterToken.clientSecret,
            "ownerEmail": "parkaviv_cse21@velhightech.com",
            "accessCode": "yqlhcX"
        })
    })
        .then(response => response.json())
        .then(response => authToken = response)

    try {
        // Make request to third-party server
        const response = await axios.get(`http://20.244.56.144/test/${numberid}`, {
            headers: {
                Authorization: `Bearer ${authToken.access_token}`
            }
        });
        console.log(response);
        const fetchedNumbers = response.data.numbers || [];

        // Filter and process fetched numbers based on numberid
        const filteredNumbers = fetchedNumbers.filter((num) => {
            if (numberid === 'p') return isPrime(num);
            if (numberid === 'f') return isFibonacci(num);
            if (numberid === 'e') return num % 2 === 0;
            if (numberid === 'r') return true; // Accept all numbers for 'r'
            return false;
        });

        // Avoid duplicates and limit to WINDOW_SIZE
        numbers = [...new Set([...numbers, ...filteredNumbers])].slice(-WINDOW_SIZE);

        // Calculate average of the current window
        const avg = calculateAverage(numbers);

        // Prepare response
        const responseObj = {
            windowPrevState: [...numbers],
            windowCurrState: [...numbers],
            numbers: fetchedNumbers,
            avg: avg.toFixed(2),
        };

        // Send response
        res.json(responseObj);
    } catch (error) {
        console.error('Error fetching data from third-party server:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Helper function to check if a number is prime
function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    let i = 5;
    while (i * i <= num) {
        if (num % i === 0 || num % (i + 2) === 0) return false;
        i += 6;
    }
    return true;
}

// Helper function to check if a number is Fibonacci
function isFibonacci(num) {
    return isPerfectSquare(5 * num * num + 4) || isPerfectSquare(5 * num * num - 4);
}

function isPerfectSquare(x) {
    const s = Math.sqrt(x);
    return s * s === x;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});