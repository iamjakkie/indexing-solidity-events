import { EventLog, TopicFilter, ethers } from 'ethers';
import saveJsonFile from './utils/saveJsonFile';
import dotenv from 'dotenv';
import fs from 'fs';
import { PairCreatedEvent } from './models';
import readJsonFile from './utils/readJsonFile';
import appendJsonFile from './utils/appendJsonFile';
// get bignumbers
import { BigNumber } from 'bignumber.js';
dotenv.config();

if (!fs.existsSync('out')) fs.mkdirSync('out');

// Uniswap V2 Factory Address
const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

async function getPairCreatedEvents() {
    // Connect to Ethereum node provider using JsonRpcProvider
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

    // Create a contract instance for the Uniswap V2 Factory
    const factoryAbi = ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'];
    const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);

    // Fetch the PairCreated events via a new filter object that represents that event
    const filter = factoryContract.filters.PairCreated();
    const startingBlock = 10000835;
    const endingBlock = 18037988;
    // const endingBlock = 10000835 + 20000;
    let currentBlock = startingBlock;
    let eventsToSave: Object[] = [];
    while (currentBlock < endingBlock) {
        // if currentBlock > endingBlock replace
        // need to add more information about transaction - inc. block number and timestamp
        let events = await factoryContract.queryFilter(filter, currentBlock, currentBlock + 10000);
        events.map((event) => {
            eventsToSave.push(
                {
                    txHash: event.transactionHash,
                    //@ts-ignore
                    token0: event.args[0],
                    //@ts-ignore
                    token1: event.args[1],
                    //@ts-ignore
                    pair: event.args[2]
                });});
        

        // Append to file

        // const fileName = "out/LP_" + currentBlock + "_" + (currentBlock+10000) + ".json";
        // saveJsonFile(eventsToSave, fileName);
        currentBlock += 10000;
    }

    saveJsonFile(eventsToSave, "out/LPs.json");
    // const events = await factoryContract.queryFilter(filter, 10000835, 18037988); //until 01.09.2023

    // Process the events (slicing to limit to the first 10 for this example)
    // const formattedEvents = events.slice(0, 10).map((event) => {
    //         return {
    //             txHash: event.transactionHash,
    //             //@ts-ignore
    //             token0: event.args[0],
    //             //@ts-ignore
    //             token1: event.args[1],
    //             //@ts-ignore
    //             pair: event.args[2]
    //         };
    //     });
}




// TODO: Add a function to fetch the token metadata

async function getTokenMetadata(tokenAddress: string): Promise<any> {
    // Connect to Ethereum node provider using JsonRpcProvider
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

    // Create a contract instance for the Uniswap V2 Factory
    const tokenAbi = ['function name() view returns (string memory)', 'function symbol() view returns (string memory)', 'function totalSupply() public view returns (uint256)'];
    const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

    // Fetch the PairCreated events via a new filter object that represents that event
    const name = await tokenContract.name();
    const symbol = await tokenContract.symbol();
    const totalSupply = await tokenContract.totalSupply();

    return { name, symbol, totalSupply };
}

// TODO: Add a function to fetch the token diluted market cap + circulating supply market cap from etherscan
// OR get price from oracle
async function getTokenMarketCap(tokenAddress: string): Promise<any> {
    
}

// TODO: Add a function to fetch add/remove liquidity events for a given LP
async function getLiquidityEvents(pairAddress: string): Promise<any> {
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    
}

// TODO: Add a function to fetch the token price
// the price should be an exact price in a given LP at a given block
// 

// async function getExactPriceWithFees(provider: ethers.JsonRpcProvider) {
//     try {
//       // Connect to the Uniswap V2 LP contract
//       const lpContract = new ethers.Contract(lpContractAddress, ['getReserves'], provider);
  
//       // Get the reserves (token balances) of the LP at the specified block number
//       const [reserve0, reserve1] = await lpContract.getReserves({ blockTag: blockNumber });
  
//       // Determine which token is PEPE and which is WETH based on their addresses
//       const isPepeFirst = pepeTokenAddress < wethTokenAddress;
//       const token0Reserve = isPepeFirst ? reserve0 : reserve1;
//       const token1Reserve = isPepeFirst ? reserve1 : reserve0;
  
//       // Calculate the exact price of PEPE in terms of WETH before fees
//       const exactPriceBeforeFees = token1Reserve / token0Reserve;
  
//       // Calculate the price including fees (0.3% fee)
//       const feePercentage = 0.003; // 0.3% fee
//       const priceIncludingFees = exactPriceBeforeFees / (1 - feePercentage);
  
//       return priceIncludingFees;
//     } catch (error) {
//       console.error('Error:', error);
//       return null;
//     }
//   }
  
//   // Usage
//   const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/your-infura-project-id'); // Replace with your Ethereum node URL or Infura project ID
  
//   getExactPriceWithFees(provider)
//     .then((priceIncludingFees) => {
//       if (priceIncludingFees !== null) {
//         console.log('Price of PEPE/WETH LP (including 0.3% fee) at Block', blockNumber);
//         console.log(`1 PEPE = ${priceIncludingFees} WETH (including fees)`);
//       } else {
//         console.log('Unable to fetch the exact price with fees.');
//       }
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
  

async function getTokenPrice(): Promise<any> {
    const pairAddress = "0xcEBc7b5fA2540e16B40a2A4364E78CEcefB7F368";
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

    const pairAbi = ['event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out,uint amount1Out,address indexed to)',
                    'event Mint(address indexed sender, uint amount0, uint amount1)',
                    'event Burn(address indexed sender, uint amount0, uint amount1, address indexed to)'];
    const iface = new ethers.Interface(pairAbi);
    const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);
    
    const filter_swap = await pairContract.filters.Swap().getTopicFilter();
    const filter_mint = await pairContract.filters.Mint().getTopicFilter();
    const filter_burn = await pairContract.filters.Burn().getTopicFilter();

    // const filter = [filter_swap.topics.concat(filter_mint).concat(filter_burn)] as Filter;

    const startingBlock = 16609100;

    const filter = [filter_swap.concat(filter_mint).concat(filter_burn)] as TopicFilter;

    let events = await pairContract.queryFilter(filter, startingBlock, startingBlock + 10000);
    // console.log(swaps);
    events.map((event) => {
        if ("args" in event) {
            const type = event.fragment.name;
            let ev;
            switch (type) {
                case "Swap":
                    console.log("SWAP");
                    ev = {
                        txHash: event.transactionHash,
                        amount0In: Number(BigNumber(event.args.amount0In.toString()).div(1e18).toString()),
                        amount1In: Number(BigNumber(event.args.amount1In.toString()).div(1e18).toString()),
                        amount0Out: Number(BigNumber(event.args.amount0Out.toString()).div(1e18).toString()),
                        amount1Out: Number(BigNumber(event.args.amount1Out.toString()).div(1e18).toString()),
                    };
                    console.log(ev);
                    break;
                case "Mint":
                    console.log("Add liquidity");
                    ev = {
                        amount0: event.args.amount0,
                        amount1: event.args.amount1,
                    };
                    console.log(ev);
                    break;
                case "Burn":
                    console.log("Remove liquidity");
                    ev = {
                        amount0: event.args.amount0,
                        amount1: event.args.amount1,
                    };
                    console.log(ev);
                    break;
                default:
                    console.log("unknown type");
                    console.log(event);

            }
        } else {
            console.log("no args:");
            console.log(event);
        }});
    // console.log("=====================================");
    // let mints = await pairContract.queryFilter(filter_mint, startingBlock, startingBlock + 10000);
    // mints.map((event) => {
    //     console.log("MINTS:");
    //     console.log(event);
    // });
    // console.log("=====================================");
    // let burns = await pairContract.queryFilter(filter_burn, startingBlock, startingBlock + 10000);
    // burns.map((event) => {
    //     console.log("BURNS:");
    //     console.log(event);
    // });


    // const filter = pairContract.filters.swap();
    // const startingBlock = 16609100;
    // const endingBlock = 16615486;
    // let currentBlock = startingBlock;
    // while (currentBlock < endingBlock) {

    //     const events = await pairContract.queryFilter(filter, currentBlock, currentBlock + 10000);
    //     events.map((event) => {
    //         console.log(event);
    //     });
        
    //     currentBlock += 10000;
    // }

}

// TODO: get rough estimate for a gas fee at a given block height


async function savePairCreatedEvents() {
  try {
      const pairCreatedEvents = await getPairCreatedEvents(); // inefficient, should dump every batch immidiately
      saveJsonFile(pairCreatedEvents, 'out/results.json');

      // Display the results to the stdout:
      const results = JSON.stringify(pairCreatedEvents, null, 2);
      console.log(results);
  } catch (error) {
      console.error('Error:', error);
  }
}

async function processPairCreatedEvents() {
    const PairCreatedEvents = readJsonFile('out/results.json');
    console.log(PairCreatedEvents)

    let mapped_tokens = new Set();

    let tokenMetadata: Record<string, any> = {};

    const promises = PairCreatedEvents.map(async (event: PairCreatedEvent) => {
        if (!mapped_tokens.has(event.token0)) {
            const token0Metadata = await getTokenMetadata(event.token0);
            console.log(token0Metadata);
            mapped_tokens.add(event.token0);
            tokenMetadata[event.token0] = [token0Metadata.name, token0Metadata.symbol, token0Metadata.totalSupply];
        }
        if (!mapped_tokens.has(event.token1)) {
            const token1Metadata = await getTokenMetadata(event.token1);
            console.log(token1Metadata);
            mapped_tokens.add(event.token1);
            tokenMetadata[event.token1] = [token1Metadata.name, token1Metadata.symbol, token1Metadata.totalSupply];
        }
    });
    await Promise.all(promises);

    saveJsonFile(tokenMetadata, 'out/tokenMetadata.json');
}

// savePairCreatedEvents();

// getPairCreatedEvents();


getTokenPrice();

// processPairCreatedEvents();


// "0x330c5eCc0a4fa773cfcBBcd1928869D6B1781318":["Miladys","밀라디스",null]

// {"txHash":"0xb7554c4e5e03bfa7045829316d29b92f01ca3205de5f96cbe90dc9cba33970cf","token0":"0x330c5eCc0a4fa773cfcBBcd1928869D6B1781318","token1":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","pair":"0x79b0180F1014Fd0eb6EC0a13599a7CDBB658EaE3"},
