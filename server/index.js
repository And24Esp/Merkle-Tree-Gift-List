const express = require('express');
const verifyProof = require('../utils/verifyProof');

const port = 1225;

const app = express();
app.use(express.json());

// This is the only list-derived value the verifier needs to keep.
const MERKLE_ROOT = 'ddd59a2ffccddd60ff47993312821cd57cf30f7f14fb82937ebe2c4dc78375aa';

app.post('/gift', (req, res) => {
  const { name, proof } = req.body ?? {};
  const isValidProof =
    typeof name === 'string' &&
    Array.isArray(proof) &&
    proof.length <= 32 &&
    proof.every(
      step =>
        step !== null &&
        typeof step === 'object' &&
        typeof step.left === 'boolean' &&
        typeof step.data === 'string' &&
        /^[0-9a-f]{64}$/i.test(step.data)
    );

  if (!isValidProof) {
    return res.status(400).send('Invalid name or proof.');
  }

  if (verifyProof(proof, name, MERKLE_ROOT)) {
    res.send("You got a toy robot!");
  }
  else {
    res.send("You are not on the list :(");
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
