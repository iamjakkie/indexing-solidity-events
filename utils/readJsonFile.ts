import fs from 'fs';
import { PairCreatedEvent } from '../models';

export default (filePath: string): PairCreatedEvent[] => {
    const json = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(json) as PairCreatedEvent[];
};