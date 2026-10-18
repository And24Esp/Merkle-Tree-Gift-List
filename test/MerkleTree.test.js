const assert = require('node:assert/strict');
const test = require('node:test');
const MerkleTree = require('../utils/MerkleTree');
const niceList = require('../utils/niceList.json');
const verifyProof = require('../utils/verifyProof');

test('the gift-list root is the expected 32-byte hash', () => {
  const tree = new MerkleTree(niceList);
  assert.equal(
    tree.getRoot(),
    'ddd59a2ffccddd60ff47993312821cd57cf30f7f14fb82937ebe2c4dc78375aa'
  );
});

test('a proof validates the listed name and rejects a different name', () => {
  const name = 'Norman Block';
  const index = niceList.indexOf(name);
  assert.notEqual(index, -1);

  const tree = new MerkleTree(niceList);
  const proof = tree.getProof(index);
  const root = tree.getRoot();

  assert.equal(verifyProof(proof, name, root), true);
  assert.equal(verifyProof(proof, 'Not on the list', root), false);
});
