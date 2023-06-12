const express = require('express');
const axios = require('axios');

const app = express();
const port = 5000;

app.get('/numbers', async (req, res) => {
  const { url } = req.query;
  const urlList = Array.isArray(url) ? url : [url];

  try {
    const fetchPromises = urlList.map(async (url) => {
      try {
        const response = await axios.get(url, { timeout: 1000 });
        return response.data.numbers;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.error(`Error fetching data from ${url}: URL not found`);
        } else if (error.code === 'ECONNABORTED') {
          console.error(`Error fetching data from ${url}: Request timed out`);
        } else {
          console.error(`Error fetching data from ${url}: ${error.message}`);
        }
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const mergedNumbers = Array.from(new Set(results.flat()));
    const sortedNumbers = mergedNumbers.sort((a, b) => a - b);

    res.json({ numbers: sortedNumbers });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
