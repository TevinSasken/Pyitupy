// backend/controllers/verifyPayment.js
import { ethers } from "ethers";

// Infura/Alchemy RPC URL
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);

const ESCROW_ADDRESS = "0xb3d69F737B01a20E56A5486e4C8Cbb88d55ed567";

export async function verifyPayment(req, res) {
  try {
    const { loan_id, sender_wallet, tx_hash, expected_amount } = req.body;

    // Fetch transaction details
    const tx = await provider.getTransaction(tx_hash);
    if (!tx) {
      return res.status(400).json({ detail: "Transaction not found on Ethereum." });
    }

    // Validate sender address
    if (tx.from.toLowerCase() !== sender_wallet.toLowerCase()) {
      return res.status(400).json({ detail: "Sender wallet does not match transaction sender." });
    }

    // Validate escrow address
    if (tx.to.toLowerCase() !== ESCROW_ADDRESS.toLowerCase()) {
      return res.status(400).json({ detail: "Funds were not sent to escrow address." });
    }

    // Validate amount (USDT = ERC20, so we must check logs OR if native ETH, check value)
    const sentAmount = Number(ethers.formatEther(tx.value)); // works if ETH
    if (sentAmount < expected_amount) {
      return res.status(400).json({ detail: "Transaction amount does not match required funding." });
    }

    // If all good
    return res.json({ message: "Transaction verified successfully!", loan_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: "Internal server error during verification." });
  }
}
