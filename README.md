![](https://i-p.rmcdn.net/65fd9abf114acc00326b972c/4693032/image-dbef989c-7504-46cf-97e1-410a19916f20.png?e=webp&nll=true)

# Gated content NFT access

Tailored for the needs of the [Ipal platform](https://app.ipal.network/), a web3 friendly [knowledge management platform](https://en.wikipedia.org/wiki/Knowledge_management_software).
See the [specification](./contracts/erc4908/README.md) for more details.

## Platform implementation

To prove that 0xAlice has access to 0xBob's specific information, the server must:

1. Authenticate 0xAlice via a message wallet signature request.
2. verify locally that `contentId` belongs to 0xBob.
3. call the `hasAccess(0xBob, contentId, 0xAlice)` contract function
4. verify that the result returned is `true`

## Development

### Getting started

```sh
npm install
```

### Tests & cleaning

```sh
npm run test # Pass env var REPORT_GAS=false to deactivate gas reporting
npm run prettier
npm run lint
```

### Deploying the contracts

```sh
cp .env.example .env
vim .env # Add the private key you want to use to deploy the contracts
npx hardhat ignition deploy ./ignition/modules/IpalBases.ts --network testnet --reset
```

### Verifying the contracts

```sh
npx hardhat verify --network testnet <CONTRACT ADDRESS> <CONSTRUCTOR_PARAMETERS>
```

Example:
```sh
npx hardhat verify --network testnet 0xd160F33090739B0999f846F54889FB344E4153f9 "https://arweave.net/Z9Gjl2bj793kIIIOOYlXVpHTZMRfJlicqybj8iY4KsE"
```

## Latest deployment

Contract:
- [basescan](https://sepolia.basescan.org/address/0xd160F33090739B0999f846F54889FB344E4153f9#writeContract)
- [blockscout](https://base-sepolia.blockscout.com/token/0xd160F33090739B0999f846F54889FB344E4153f9)

NFT example:
- [opensea](https://testnets.opensea.io/assets/base-sepolia/0xd160F33090739B0999f846F54889FB344E4153f9/0)
- [blockscout](https://base-sepolia.blockscout.com/token/0xd160F33090739B0999f846F54889FB344E4153f9/instance/0)

## License

Copyright (c) 2024 Ipal

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
