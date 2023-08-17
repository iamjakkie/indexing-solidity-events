import fs from 'fs';

export default (json: any, filePath: string): void => {
    const jsonString = JSON.stringify(json);
    fs.writeFileSync(filePath, jsonString); 
};