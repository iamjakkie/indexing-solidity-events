import fs from 'fs';

export default (data: any, filePath: string): void => {
    // check if data is an array of objects
    if (!Array.isArray(data)) {
        fs.appendFileSync(filePath, data);
    } else {
        data.forEach((element: any) => {
            fs.appendFileSync(filePath, JSON.stringify(element));
        });
    }
    
};