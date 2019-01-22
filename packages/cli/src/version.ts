import * as path from 'path';
import * as fs from 'fs';

const filePath = path.resolve(__dirname, '../package.json');
const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
const packageJSON = JSON.parse(content) as {
  version: string;
};

export const version = packageJSON.version;
