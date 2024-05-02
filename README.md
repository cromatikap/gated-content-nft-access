# Gated content NFT access contracts

This project is a set of smart contracts that allow for the creation of NFTs that can be used to access gated content. The NFTs are minted by the content creator and can be used to access the content for a set period of time. The NFTs can be transferred to other users, who can then access the content for the remaining time.

## Documentation

### Usage

WIP

## Development

### Getting started

```sh
npm install
REPORT_GAS=true npx hardhat test
```

### Deploying the contracts

```sh
cp .env.example .env
vim .env # Add the private key you want to use to deploy the contracts
npx hardhat ignition deploy ./ignition/modules/IpalBases.ts --network testnet --reset
```
