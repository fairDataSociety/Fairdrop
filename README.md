# Readme - Fairdrop

## About Fairdrop

Fairdrop is a free, decentralised, private and secure file transfer dapp contributed to Fair Data Society by Datafund. It is the first blockchain product based on Fair Data Society principles. This means that Fairdrop completely respects your privacy and doesn’t need or collect any personal data. It runs on the Ethereum network and uses Swarm’s decentralised storage system for file storing and sending. This means:

- No central servers.
- No tracking.
- No backdoors.

It also comes with a built-in 256-bit ECDSA signature algorithm and the ability.

An official hosted beta version of Fairdrop is available for you at fairdrop.xyz - it's free to use and all of your data is encrypted before it leaves your browser!

You are also able to run your own copy of the code which you may download from the [github repository](http://github.com/fairDataSociety/Fairdrop)

![header image](https://raw.github.com/fairdatasociety/fairdrop/master/fairdrop.gif)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

For technical issues, use this project's [issue tracking](https://github.com/fairDataSociety/Fairdrop/issues).

### Dependencies

Before we get started, you'll need to install `yarn` package manager.

```
yarn install
```

### First time setup

The first step to running Fairdrop locally is downloading the code by cloning the repository:

```
git clone git@github.com:fairDataSociety/Fairdrop.git
```

If you get Permission denied error using `ssh` refer [here](https://help.github.com/en/github/authenticating-to-github/error-permission-denied-publickey) or use https link as a fallback.

```
git clone https://github.com/fairDataSociety/Fairdrop.git
```

Go to project root directory

```
cd Fairdrop
```

Now run the devserver

```
yarn start
```

To build static assets for deployment in ./build

```
yarn build
```

You can see your app running on http://localhost:3000/

## Deployment

Add additional notes about how to deploy this on a live system

## Contributing

When contributing to this repository, please first discuss the change you wish to make via [issue](https://github.com/fairDataSociety/Fairdrop/issues), email, or any other method with the owners of this repository before making a change.

1. Fork the repository
1. Clone the repository (`git clone git@github.com:your_username/Fairdrop.git`)
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Add changes to the branch (`git add <list names of changed files>`)
1. Commit your changes (`git commit -m 'Add some feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Submit your changes for review (`Create new Pull Request`)

## Donations

For people who would like to support the development of Fairdrop we also accept donations in ETH or tokens.

You can supports us via:

Gitcoin:
https://gitcoin.co/grants/280/fairdrop-secure-private-unstoppable-file-transfer

Giveth
https://beta.giveth.io/campaigns/5c81316527ae4211c836be4e

## Authors

@significance
@crtahlin
@gasperx93
@mancas

## License

This project is licensed under the GPL3 License -
