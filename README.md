# Indexing Soliditiy Events

This is a basic example that indexes [PairCreated event](https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Factory.sol#L13C11-L13C22) in Uniswap V2 contracts.

An example of a PairCreated event is [here](https://etherscan.io/tx/0x8cb0d09a70179e09ea2df0c9f135db53a9e66c6ead25408b7a4fe7f5a0cb589b#eventlog).

This script is basic such that it only indexes the `PairCreated` event as explained above, from block `17900000` and returns the first 10 events formatted and filtered.

The intention is to provide a starting point for indexing more events, a complex series of events, events further back in block time, integrating events data and exporting events data.

## Install and run

1. Clone this repo
1. Install dependencies: `npm i`
1. Run the script: `npm run index`