const server = require('express');

const PORT = process.env.PORT || 5000;

const app = server();

app.get('/', (_, res) => {
  res.send('Funne API');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
