const axios = require('axios');
const niceList = require('../utils/niceList.json');
const MerkleTree = require('../utils/MerkleTree');

const serverUrl = 'http://localhost:1225';

async function main() {
  const name = process.argv.slice(2).join(' ') || 'Norman Block';
  const index = niceList.findIndex(entry => entry === name);

  if (index === -1) {
    throw new Error(`"${name}" is not in the gift list.`);
  }

  const merkleTree = new MerkleTree(niceList);
  const proof = merkleTree.getProof(index);
  const { data: response } = await axios.post(`${serverUrl}/gift`, {
    name,
    proof,
  });

  console.log(response);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});