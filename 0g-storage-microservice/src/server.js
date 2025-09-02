// 0g-storage-service/src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import fsp from 'fs/promises';
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';
import { PassThrough } from 'stream';

const app = express();
app.use(cors());
app.use(express.json());

// Ensure tmp folder exists
if (!fs.existsSync('tmp')) fs.mkdirSync('tmp', { recursive: true });

// Multer for temp file storage
const upload = multer({
  dest: 'tmp/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Env + SDK wiring
const RPC_URL = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai/';
const INDEXER_RPC = process.env.INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('Missing PRIVATE_KEY in .env');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const indexer = new Indexer(INDEXER_RPC);

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Upload endpoint
app.post('/storage/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required (multipart field name "file")' });

  const filePath = req.file.path;
  try {
    const zgFile = await ZgFile.fromFilePath(filePath, { blockSize: 1024 * 1024 });
    const [tree, treeErr] = await zgFile.merkleTree();
    if (treeErr) {
      await zgFile.close();
      throw new Error(`merkleTree failed: ${treeErr}`);
    }
    const rootHash = tree?.rootHash();

    const [tx, uploadErr] = await indexer.upload(zgFile, RPC_URL, signer);
    await zgFile.close();
    if (uploadErr) throw new Error(`upload failed: ${uploadErr}`);

    await fsp.unlink(filePath).catch(() => {});

    return res.json({
      rootHash,
      txHash: tx,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    console.error(err);
    await fsp.unlink(filePath).catch(() => {});
    return res.status(500).json({ error: String(err?.message || err) });
  }
});

// Download endpoint (fixed)
app.get('/storage/download/:rootHash', async (req, res) => {
  try {
    const { rootHash } = req.params;
    const [zgFile, err] = await indexer.downloadFile(rootHash); // fixed method
    if (err || !zgFile) throw new Error(err || 'File not found');

    const passThrough = new PassThrough();
    zgFile.stream().pipe(passThrough);

    res.setHeader('Content-Disposition', `attachment; filename=${rootHash}`);
    passThrough.pipe(res);

    passThrough.on('end', async () => {
      await zgFile.close().catch(() => {});
    });

  } catch (err) {
    console.error(err);
    return res.status(404).json({ error: 'Not found', details: String(err?.message || err) });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`0G storage service listening on http://localhost:${port}`);
});
