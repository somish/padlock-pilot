#!/bin/bash
set -e

SERVER=whiskey.blox.consulting

if [[ $CIRCLECI = "true" ]]; then
  ssh-keyscan $SERVER >> ~/.ssh/known_hosts
  ssh -v -N -L 5984:localhost:5984 circleci@$SERVER &
  sleep 5
fi

export CI=false

echo "=== GLOBAL ==="
npm install
npm run fmt:test

echo "=== FRONTEND ==="
cd frontend
echo "$ npm install"
npm install
echo "$ npm run build"
npm run build

echo "=== BACKEND ==="
cd ../backend
echo "$ npm install"
npm install
echo "$ npm run test"
npm run test
