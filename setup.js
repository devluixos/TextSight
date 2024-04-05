const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter your API key: ', function(apiKey) {
  fs.writeFileSync('.env', `OPENAI_API_KEY=${apiKey}\n`);
  console.log('Successfully wrote API key to .env file.');
  rl.close();
});