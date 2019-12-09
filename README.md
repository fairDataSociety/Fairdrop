# Fairdrop

Fairdrop is a file transfer dapp. It’s the first blockchain product by Fair Data Society and one whose design is based entirely on the Fair Data Society (FDS) principles. It doesn’t collect any data, runs on the Ethereum network and uses Swarm’s decentralised storage system as its functional backbone.

clone repo

`git clone git@github.com:fairDataSociety/Fairdrop.git`

`cd Fairdrop`

install dependencies

`npm install`

run devserver

`npm start`

to build static assets for deployment in ./build

`npm build`

## Fairdrop version 0.4.6 specifics (might be relevant for later releases also)

Make sure you have [node 12](https://nodejs.org/en/about/releases/) installed on your computer.

clone repo

`git clone git@github.com:fairDataSociety/Fairdrop.git`

`cd Fairdrop`

checkout version code

`git checkout 0.4.6`

delete node_modules

`rm -rf node_modules`

install dependencies

`npm i`

run site to test

`npm run start`

build static site

`npm run build`

## Fairdrop suggest edits process

1/ fork the repo at github.com
2/ clone the forked repo `git clone ...` `cd fairdrop`
2/ checkout the latest working branch (e.g. for beta) `git checkout beta`
3/ install deps and run dev server
4/ make changes
5/ check they worked, and nothing else is broken
6/ commit your changes git add . && git commit -m "my useful commit message"
7/ push to github `git push origin beta`
8/ go to github.com and make a pull request against original repo
