import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

// Replace with the actual addresses
const factoryAddress = '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f';

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

async function getPairCreatedEvents(): Promise<any[]> {
    // Connect to Ethereum provider
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

    // Create a contract instance for the Uniswap V2 Factory
    const factoryAbi = ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'];
    const factoryContract = new ethers.Contract(factoryAddress, factoryAbi, provider);

    // Fetch the PairCreated events
    const filter = factoryContract.filters.PairCreated();
    const events = await factoryContract.queryFilter(filter, 17900000);

    // Process the events
    const formattedEvents = events.slice(0, 10).map((event) => {
        event
            return {
                //@ts-ignore
                token0: event.args[0],
                //@ts-ignore
                token1: event.args[1],
                //@ts-ignore
                pair: event.args[2],
                //@ts-ignore
                // allPairsLength: event.args[3]
            };
        });

        return formattedEvents;
}


(async () => {
    try {
        const pairCreatedEvents = await getPairCreatedEvents();
        console.log(JSON.stringify(pairCreatedEvents, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
})();