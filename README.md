# Merkle Tree Gift List

This project demonstrates how to prove that a name is on a gift list without
sending the entire list to the server. The client acts as the **prover** and
sends a Merkle proof. The server acts as the **verifier** and checks the proof
against one fixed 32-byte Merkle root.

## Requirements

- Node.js 18 or newer
- npm

## Install dependencies

From the project root, run:

```sh
npm install
```

## Run the application

Start the server in one terminal:

```sh
node server/index.js
```

The server listens on `http://localhost:1225`.

In a second terminal, ask the client to request a gift:

```sh
node client/index.js
```

The default name is `Norman Block`, which is on the list. You can also choose
another listed person by passing their full name as a command-line argument:

```sh
node client/index.js "Sidney Kertzmann"
```

The client creates a Merkle tree from `utils/niceList.json`, finds the chosen
name, builds its proof, and sends only the name and proof to the server. If the
name is not in the local list, the client reports that fact and does not make
a request.

To see how the basic tree operations work independently of the server, run:

```sh
node utils/example.js
```

## Tests

Run the automated Merkle-tree tests from the project root:

```sh
npm test
```

The tests check that the list produces the root pinned in the server and that a
member's proof verifies for that name but not for a different name.

For an end-to-end rejection check, keep the server running and submit a
well-formed proof that does not match the name:

```powershell
Invoke-RestMethod -Uri http://localhost:1225/gift -Method Post `
  -ContentType 'application/json' `
  -Body '{"name":"Not on the list","proof":[]}'
```

The expected response is `You are not on the list :(`. Malformed proof data
should receive HTTP `400`.

## How the Merkle proof works

Each list entry is hashed with Keccak-256 to create a leaf. Neighboring leaves
are combined and hashed repeatedly until one root remains. A proof contains the
hashes needed to rebuild that root from a single name. The server hashes the
submitted name, combines it with the proof hashes in the indicated order, and
accepts it only if the result matches its stored root.

The root is specific to the exact contents and order of `utils/niceList.json`.
If you edit that list, recalculate the root with:

```sh
node -e "const MerkleTree = require('./utils/MerkleTree'); const list = require('./utils/niceList.json'); console.log(new MerkleTree(list).getRoot());"
```

Replace `MERKLE_ROOT` in `server/index.js` and the expected root in
`test/MerkleTree.test.js` with the new result.

## Changes by file

- **`client/index.js`** — Selects a name from the command line (or uses
  `Norman Block`), finds its index, builds its Merkle proof, and sends the name
  and proof to the server. It reports a name missing from the local gift list
  without making a request, and prints request errors clearly.
- **`server/index.js`** — Stores only the hard-coded 32-byte Merkle root needed
  for verification. It validates the request and proof structure, verifies the
  proof, returns the toy robot message for a valid member, and rejects
  non-members.
- **`utils/MerkleTree.js`** — Fixes conversion of each leaf to a Buffer. Using
  `Buffer.from` directly as an `Array.map` callback also passes the array index
  as an extra argument, which can be interpreted as an encoding.
- **`test/MerkleTree.test.js`** — Adds regression tests for the pinned root and
  for accepting a valid proof while rejecting a different name.
- **`package.json`** — Adds the `npm test` command using Node's built-in test
  runner; no test dependency is needed.
- **`README.md`** — Documents installation, running both processes, automated
  and manual rejection tests, root updates, and the purpose of each change.
