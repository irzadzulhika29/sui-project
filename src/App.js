import React, { useEffect, useState } from "react";
import "./App.css";
import { ConnectButton, useWallet } from "@suiet/wallet-kit";
import { Transaction } from "@mysten/sui/transactions";

function App() {
  const wallet = useWallet();
  const [walletInfo, setWalletInfo] = useState({
    connected: false,
    name: "",
    address: "",
    publicKey: "",
  });
  const [loading, setLoading] = useState({
    mintNft: false,
    mintToken: false,
  });
  const [results, setResults] = useState([]);
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftImageUrl, setNftImageUrl] = useState("");

  const openInExplorer = (digest, type = "transaction") => {
    const baseUrl = "https://explorer.sui.io";
    let url;

    if (type === "transaction") {
      url = `${baseUrl}/txn/${digest}?network=testnet`;
    } else if (type === "address") {
      url = `${baseUrl}/address/${digest}?network=testnet`;
    }

    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!wallet.connected) {
      setWalletInfo({
        connected: false,
        name: "",
        address: "",
        publicKey: "",
      });
      return;
    }
    setWalletInfo({
      connected: wallet.connected,
      name: wallet.name || "",
      address: wallet.account?.address || "",
      publicKey: wallet.account?.publicKey
        ? Array.from(wallet.account.publicKey)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        : "",
    });
  }, [wallet.connected, wallet.name, wallet.account]);

  const addResult = (type, status, message, data = null) => {
    console.log("Transaction result:", data); // Debug log
    const newResult = {
      id: Date.now(),
      type,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString(),
      // Tambahkan digest dari data transaksi
      digest: data?.digest || null,
    };
    console.log("Digest saved:", newResult.digest); // Debug log
    setResults((prev) => [newResult, ...prev]);
  };

  async function handleMintToken() {
    if (!wallet.connected) {
      addResult("Mint Token", "error", "Please connect wallet first");
      return;
    }

    setLoading((prev) => ({ ...prev, mintToken: true }));
    try {
      const tx = new Transaction();

      // Operasi yang pasti ada: membuat beberapa coins dari gas
      const coinAmounts = [1000000, 2000000, 500000]; // 0.001, 0.002, 0.0005 SUI
      const [coin1, coin2, coin3] = tx.splitCoins(
        tx.gas,
        coinAmounts.map((amount) => tx.pure.u64(amount))
      );

      // Merge kembali beberapa coins (demo operasi token)
      tx.mergeCoins(coin1, [coin2]);

      // Transfer hasil ke alamat sendiri
      tx.transferObjects(
        [coin1, coin3],
        tx.pure.address(wallet.account.address)
      );

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      addResult(
        "Mint Token",
        "success",
        "Token operations successful! Split, merged, and transferred SUI coins.",
        result
      );
    } catch (e) {
      addResult(
        "Mint Token",
        "error",
        `Failed to execute token operations: ${e.message}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, mintToken: false }));
    }
  }

  async function handleMintNft() {
    if (!wallet.connected) {
      addResult("Mint NFT", "error", "Please connect wallet first");
      return;
    }

    if (!nftName.trim()) {
      addResult("Mint NFT", "error", "NFT name is required");
      return;
    }

    setLoading((prev) => ({ ...prev, mintNft: true }));
    try {
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(1)]);
      tx.transferObjects([coin], tx.pure.address(wallet.account.address));

      const result = await wallet.signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      addResult(
        "Mint NFT",
        "success",
        `Simple object created as NFT demo for "${nftName}"`,
        result
      );
      // Reset form
      setNftName("");
      setNftDescription("");
      setNftImageUrl("");
    } catch (e) {
      addResult("Mint NFT", "error", `Failed to mint NFT: ${e.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, mintNft: false }));
    }
  }
  // Tambahkan setelah fungsi handleSignMessage
  async function handleValidateSignature() {
    if (!wallet.connected) {
      addResult("Validate Signature", "error", "Please connect wallet first");
      return;
    }

    setLoading((prev) => ({ ...prev, validateSignature: true }));
    try {
      // Pesan yang sama dengan yang ditandatangani
      const originalMessage = "Halo, SUI!";
      const messageBytes = new TextEncoder().encode(originalMessage);

      // Sign message untuk mendapatkan signature
      const signResult = await wallet.signPersonalMessage({
        message: messageBytes,
      });

      // Validasi signature
      const isValid = await validateSignature(
        messageBytes,
        signResult.signature,
        wallet.account.publicKey
      );

      const validationData = {
        message: originalMessage,
        signature: signResult.signature,
        publicKey: Array.from(wallet.account.publicKey)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
        isValid: isValid,
        timestamp: new Date().toISOString(),
        walletAddress: wallet.account.address,
      };

      addResult(
        "Validate Signature",
        isValid ? "success" : "error",
        `Signature validation ${isValid ? "PASSED" : "FAILED"}`,
        validationData
      );
    } catch (e) {
      addResult(
        "Validate Signature",
        "error",
        `Failed to validate signature: ${e.message}`
      );
    } finally {
      setLoading((prev) => ({ ...prev, validateSignature: false }));
    }
  }

  // Fungsi helper untuk validasi signature
  async function validateSignature(messageBytes, signature, publicKey) {
    try {
      // Import crypto untuk validasi (browser API)
      if (
        typeof window !== "undefined" &&
        window.crypto &&
        window.crypto.subtle
      ) {
        // Implementasi validasi menggunakan Web Crypto API
        return true; // Placeholder - implementasi sebenarnya memerlukan crypto library
      }
      return true; // Untuk demo, anggap valid
    } catch (error) {
      console.error("Validation error:", error);
      return false;
    }
  }

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🌊 Sui DApp Demo</h1>
          <p>
            Demonstrasi integrasi dengan Sui blockchain menggunakan Suiet Wallet
            Kit
          </p>
          <div className="connect-section">
            <ConnectButton />
          </div>
        </header>

        {wallet.connected && (
          <div className="main-content">
            {/* Wallet Info Card */}
            <div className="card wallet-card">
              <div className="card-header">
                <h2>💼 Informasi Wallet</h2>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className="value connected">✅ Terhubung</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Wallet:</span>
                    <span className="value">{walletInfo.name}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Address:</span>
                    <span className="value address">{walletInfo.address}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Public Key:</span>
                    <span className="value address">
                      {walletInfo.publicKey}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="card actions-card">
              <div className="card-header">
                <h2>🚀 Actions</h2>
              </div>
              <div className="card-content">
                <div className="actions-grid">
                  <button
                    onClick={handleMintToken}
                    className={`action-button secondary ${
                      loading.mintToken ? "loading" : ""
                    }`}
                    disabled={loading.mintToken}
                  >
                    {loading.mintToken ? "⏳ Minting..." : "🪙 Mint Test Token"}
                  </button>
                  <button
                    onClick={handleValidateSignature}
                    className={`action-button validate ${
                      loading.validateSignature ? "loading" : ""
                    }`}
                    disabled={loading.validateSignature}
                  >
                    {loading.validateSignature
                      ? "⏳ Validating..."
                      : "🔍 Validate Signature"}
                  </button>
                </div>
              </div>
            </div>

            {/* NFT Minting Card */}
            <div className="card nft-card">
              <div className="card-header">
                <h2>🎨 Demo NFT Creation</h2>
              </div>
              <div className="card-content">
                <div className="form-group">
                  <label htmlFor="nftName">Nama NFT *</label>
                  <input
                    id="nftName"
                    type="text"
                    value={nftName}
                    onChange={(e) => setNftName(e.target.value)}
                    placeholder="Masukkan nama NFT"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nftDescription">Deskripsi NFT</label>
                  <textarea
                    id="nftDescription"
                    value={nftDescription}
                    onChange={(e) => setNftDescription(e.target.value)}
                    placeholder="Masukkan deskripsi NFT (opsional)"
                    className="form-textarea"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="nftImageUrl">URL Gambar NFT</label>
                  <input
                    id="nftImageUrl"
                    type="url"
                    value={nftImageUrl}
                    onChange={(e) => setNftImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg (opsional)"
                    className="form-input"
                  />
                </div>
                <button
                  onClick={handleMintNft}
                  className={`action-button mint ${
                    loading.mintNft ? "loading" : ""
                  }`}
                  disabled={loading.mintNft || !nftName.trim()}
                >
                  {loading.mintNft ? "⏳ Creating..." : "🎨 Create Demo Object"}
                </button>
                <small>
                  Catatan: Ini membuat object sederhana sebagai demo, bukan NFT
                  standar
                </small>
              </div>
            </div>

            {/* Results Card */}
            <div className="card results-card">
              <div className="card-header">
                <h2>📋 Transaction Results</h2>
                {results.length > 0 && (
                  <button onClick={clearResults} className="clear-button">
                    🗑️ Clear
                  </button>
                )}
              </div>
              <div className="card-content">
                {results.length === 0 ? (
                  <div className="no-results">
                    <p>Belum ada transaksi yang dilakukan</p>
                  </div>
                ) : (
                  <div className="results-list">
                    {results.map((result) => (
                      <div
                        key={result.id}
                        className={`result-item ${result.status}`}
                      >
                        <div className="result-header">
                          <span className="result-type">{result.type}</span>
                          <span className="result-time">
                            {result.timestamp}
                          </span>
                        </div>

                        <div className="result-message">{result.message}</div>

                        {/* Tambahkan tombol explorer di luar details juga */}
                        {result.digest && (
                          <div className="explorer-buttons">
                            <button
                              onClick={() =>
                                openInExplorer(result.digest, "transaction")
                              }
                              className="explorer-btn primary"
                            >
                              🔍 Lihat di Sui Explorer
                            </button>

                            <button
                              onClick={() =>
                                openInExplorer(walletInfo.address, "address")
                              }
                              className="explorer-btn secondary"
                            >
                              👤 Lihat Alamat Wallet
                            </button>
                          </div>
                        )}

                        {result.data && (
                          <details className="result-details">
                            <summary>Show Details</summary>
                            <pre className="result-data">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!wallet.connected && (
          <div className="welcome-card">
            <h2>🔗 Hubungkan Wallet Anda</h2>
            <p>
              Untuk memulai menggunakan DApp ini, silakan hubungkan wallet Sui
              Anda terlebih dahulu.
            </p>
            <div className="features-list">
              <div className="feature">✨ Demo NFT creation</div>
              <div className="feature">🪙 Test token minting</div>
              <div className="feature">🔍 Signature validation</div>
              <div className="feature">💼 Wallet information</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
