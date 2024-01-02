/**
 * This lets us run the Express server locally
 */
const app = require('./server-app')

const PORT = process.env.SERVER_PORT ? process.env.SERVER_PORT : 8182;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});