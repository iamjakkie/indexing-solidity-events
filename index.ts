import { ethers } from 'ethers';
import saveJsonFile from './utils/saveJsonFile';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

if (!fs.existsSync('out')) fs.mkdirSync('out');

// Uniswap V2 Factory Address
const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

async function getPairCreatedEvents(): Promise<any[]> {
    // Connect to Ethereum node provider using JsonRpcProvider
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

    // Create a contract instance for the Uniswap V2 Factory
    const factoryAbi = ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'];
    const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);

    // Fetch the PairCreated events via a new filter object that represents that event
    const filter = factoryContract.filters.PairCreated();
    const events = await factoryContract.queryFilter(filter, 17900000);

    // Process the events (slicing to limit to the first 10 for this example)
    const formattedEvents = events.slice(0, 10).map((event) => {
        console.log(event)
            return {
                txHash: event.transactionHash,
                //@ts-ignore
                token0: event.args[0],
                //@ts-ignore
                token1: event.args[1],
                //@ts-ignore
                pair: event.args[2]
            };
        });

        return formattedEvents;
}


(async () => {
    try {
        // save the json file to disk (can then upload this file to AWS S3 or other storage as required)
        const pairCreatedEvents = await getPairCreatedEvents();
        saveJsonFile(pairCreatedEvents, 'out/results.json');

        // Display the results to the stdout:
        const results = JSON.stringify(pairCreatedEvents, null, 2);
        console.log(results);
    } catch (error) {
        console.error('Error:', error);
    }
})();