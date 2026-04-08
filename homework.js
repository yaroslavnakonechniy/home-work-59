import fs, { existsSync } from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { access } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import crypto from 'node:crypto';


async function compressFile(filePath) {

    try {
      await access(filePath, fs.F_OK);
    } catch {
      throw new Error(`Вхідний файл не знайдено: ${filePath}`);
    }

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath, ext);
    const newFileName = `${fileName}+${Date.now()}+${crypto.randomBytes(16).toString('hex')}`;

    let outputPath = path.join(dir, `${newFileName}.gz`);

    const readStream = fs.createReadStream(filePath);
    const gzip = zlib.createGzip();
    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(readStream, gzip, writeStream);

    return outputPath;

}

async function decompressFile(compressedFilePath, destinationFilePath) {
    try {
      await access(compressedFilePath, fs.F_OK);
    } catch {
      throw new Error(`Вхідний файл не знайдено: ${filePath}`);
    }

    if (path.extname(compressedFilePath) !== '.gz') {
      throw new Error('Файл не є gzip (.gz)');
    }

    const dir = path.dirname(destinationFilePath);
    const ext = path.extname(destinationFilePath);
    const fileName = path.basename(destinationFilePath, ext);

    const newFileName = `${fileName}+${Date.now()}+${crypto.randomBytes(16).toString('hex')}`;

    let outputPath = path.join(dir, `${newFileName}.txt`);

    const readStream = fs.createReadStream(compressedFilePath);
    const gunzip = zlib.createGunzip();
    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(readStream, gunzip, writeStream);

    return outputPath;
}

async function performCompressionAndDecompression() {
  try {
    //const compressedResult = await compressFile('./files/source.txt')
    const compressedResult = await compressFile('./my-data.txt')
    console.log(compressedResult)
    //const decompressedResult = await decompressFile(compressedResult, './files/source_decompressed.txt')
    const decompressedResult = await decompressFile(compressedResult, './my-data-d.txt')
    console.log(decompressedResult)
  } catch (error) {
    console.error('Error during compression or decompression:', error)
  }
}

performCompressionAndDecompression();
