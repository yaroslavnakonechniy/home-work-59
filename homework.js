import fs, { existsSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pipeline } from 'node:stream/promises';


async function compressFile(filePath) {

    if (!existsSync(filePath)) {
        throw new Error(`Вхідний файл не знайдено: ${filePath}`);
    }

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const name = path.basename(filePath, ext);

    let outputPath = path.join(dir, `${name}.gz`);

    let counter = 1;
    while (existsSync(outputPath)) {
      outputPath = path.join(dir, `${name}(${counter})${ext}.gz`);
      counter++;
    }

    const readStream = fs.createReadStream(filePath);
    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(readStream, gzip, writeStream);

    return outputPath;

}

async function decompressFile(compressedFilePath, destinationFilePath) {
    if (!existsSync(compressedFilePath)) {
      throw new Error(`Файл не знайдено: ${compressedFilePath}`);
    }

    if (path.extname(compressedFilePath) !== '.gz') {
      throw new Error('Файл не є gzip (.gz)');
    }

    const dir = path.dirname(destinationFilePath);
    const ext = path.extname(destinationFilePath);
    const name = path.basename(destinationFilePath, ext);

    let outputPath = destinationFilePath;

    let counter = 1;
    while (existsSync(outputPath)) {
      outputPath = path.join(dir, `${name}(${counter})${ext}`);
      counter++;
    }

    const readStream = fs.createReadStream(compressedFilePath);
    const gunzip = zlib.createGunzip();
    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(readStream, gunzip, writeStream);

    return outputPath;
}

async function performCompressionAndDecompression() {
  try {
    const compressedResult = await compressFile('./files/source.txt')
    //const compressedResult = await compressFile('./my-data.txt')
    console.log(compressedResult)
    const decompressedResult = await decompressFile(compressedResult, './files/source_decompressed.txt')
    //const decompressedResult = await decompressFile(compressedResult, './my-data-d.txt')
    console.log(decompressedResult)
  } catch (error) {
    console.error('Error during compression or decompression:', error)
  }
}

performCompressionAndDecompression();
