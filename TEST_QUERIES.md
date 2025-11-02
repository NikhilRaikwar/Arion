# Alchemy API Test Queries for UI

## Test these queries in your chat interface to verify all endpoints work correctly

---

## 🔍 **Balance & Portfolio Queries**

### **1. Single Chain Balance - Ethereum**
```
show balance for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on ethereum
```
**Expected**: ETH balance + any ERC20 tokens on Ethereum

### **2. Single Chain Balance - Polygon**
```
show balance for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on polygon
```
**Expected**: MATIC: 0.525 + USDC: 19.18 + other tokens

### **3. Multi-Chain Balance**
```
show balance for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on multi networks
```
**Expected**: Balances from Ethereum, Polygon, Arbitrum, Optimism, Base

### **4. Alternative Multi-Chain Query**
```
check wallet 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 all chains
```

### **5. My Balance (Connected Wallet)**
```
show my balance on polygon
```
**Note**: Must have wallet connected

---

## 🖼️ **NFT Queries**

### **6. NFTs on Ethereum**
```
show nfts on ethereum for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```
**Expected**: NFT with inline images (nikhilraikwar.eth ENS)

### **7. NFTs on Polygon**
```
show nfts on polygon for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```
**Expected**: Multiple NFTs with inline images

### **8. Full NFT List with Images**
```
show nfts on polygon for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```
Then follow up with:
```
full list with images
```
**Expected**: All NFTs displayed with embedded images

### **9. NFTs on Multiple Chains**
```
show all my nfts on ethereum and polygon for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```

---

## 📊 **Transaction Queries**

### **10. Transaction History - Ethereum**
```
show transactions for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on ethereum
```
**Expected**: Recent transactions with details

### **11. Transaction History - Polygon**
```
show transaction history for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on polygon
```

### **12. Recent Transactions**
```
what are the recent transactions for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```

---

## 📜 **Smart Contract Queries**

### **13. Validate Contract - USDC on Polygon**
```
validate contract 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 on polygon
```
**Expected**: Contract details, token metadata (USDC)

### **14. Validate Contract - BAYC**
```
check contract 0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D on ethereum
```
**Expected**: Bored Ape Yacht Club contract details

### **15. Contract Details**
```
tell me about contract 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 on polygon
```

---

## 🔄 **Follow-Up Context Queries**

### **16. Follow-up After NFT Query**
First:
```
show nfts on polygon for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```
Then:
```
show me more details
```

### **17. Follow-up After Balance Query**
First:
```
show balance on polygon for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```
Then:
```
what about ethereum?
```

---

## 🎯 **Specific Token Queries**

### **18. Check Specific Token Balance**
```
how much USDC does 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 have on polygon?
```
**Expected**: 19.18 USDC

### **19. Check Native Token**
```
how much MATIC does 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 have?
```
**Expected**: 0.525 MATIC

---

## 🌐 **Chain-Specific Queries**

### **20. Base Network**
```
show balance for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on base
```

### **21. Arbitrum Network**
```
check balance on arbitrum for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```

### **22. Optimism Network**
```
show wallet 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 balance on optimism
```

---

## 📱 **Short/Natural Queries**

### **23. Simple Balance Check**
```
balance of 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```

### **24. Simple NFT Check**
```
nfts for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```

### **25. Quick Portfolio Check**
```
portfolio 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
```

---

## 🧪 **Edge Cases to Test**

### **26. Invalid Address**
```
show balance for 0x123
```
**Expected**: Error message about invalid address format

### **27. Empty Wallet**
```
show balance for 0x0000000000000000000000000000000000000000 on ethereum
```
**Expected**: "No tokens found" or 0 balance

### **28. Non-Contract Address**
```
validate contract 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on ethereum
```
**Expected**: "Address is not a smart contract"

---

## ✅ **Expected Results Summary**

For wallet `0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8`:

### **Polygon Balances** (Verified with curl):
- **MATIC**: 0.525 (native)
- **USDC**: 19.18 (ERC20)
- **Other tokens**: Check for non-zero balances

### **NFTs**:
- **Ethereum**: Should show nikhilraikwar.eth ENS name
- **Polygon**: Should show ~15+ NFTs with inline images

### **Contracts**:
- **USDC on Polygon**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`
- **BAYC on Ethereum**: `0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D`

---

## 🐛 **Debug Queries**

If balances show 0.00 when they shouldn't:

### **29. Direct API Test (Polygon)**
```
curl -X POST "https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_getBalance","params":["0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8","latest"]}'
```

### **30. Token Balances Test**
```
curl -X POST "https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"alchemy_getTokenBalances","params":["0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8","erc20"]}'
```

---

## 📝 **Testing Checklist**

Use this checklist to verify all features:

- [ ] ✅ Single chain balance (Ethereum)
- [ ] ✅ Single chain balance (Polygon) - Should show USDC
- [ ] ✅ Multi-chain balance - Should query all 5 networks
- [ ] ✅ NFT query (Ethereum) - Image displays inline
- [ ] ✅ NFT query (Polygon) - Multiple images inline
- [ ] ✅ Full NFT list - All images embedded
- [ ] ✅ Transaction history
- [ ] ✅ Contract validation (USDC)
- [ ] ✅ Contract validation (BAYC)
- [ ] ✅ Follow-up queries work (not blocked)
- [ ] ✅ Images auto-resize for screen
- [ ] ✅ Images clickable to enlarge
- [ ] ✅ IPFS URLs converted to gateway
- [ ] ✅ OpenSea links work
- [ ] ✅ Explorer links work
- [ ] ✅ Error handling (invalid address)
- [ ] ✅ Empty wallet handling
- [ ] ✅ Non-contract address detection

---

## 🚨 **Known Issues to Check**

### **Issue 1: Balance Shows 0.00**
**Symptoms**: Balance query returns 0 when wallet has funds  
**Debug**:
1. Check server logs for errors
2. Verify API key is correct
3. Test with curl command directly
4. Check if `getTokenBalancesWithPrices` is being called

### **Issue 2: NFT Images Don't Display**
**Symptoms**: Shows "View Image" link instead of inline image  
**Debug**:
1. Check if AI is using `![](url)` syntax
2. Verify IMAGE_URL is in the data
3. Check browser console for image load errors
4. Test IPFS gateway accessibility

### **Issue 3: Multi-Chain Doesn't Query All Chains**
**Symptoms**: Only shows one chain when asked for multi-chain  
**Debug**:
1. Check if keyword detection is working
2. Verify `chains` array includes all 5 networks
3. Check logs for which chains are queried

---

## 📊 **Performance Benchmarks**

Expected response times:
- **Balance query**: < 3 seconds
- **NFT query**: < 5 seconds
- **Transaction query**: < 4 seconds
- **Contract validation**: < 2 seconds
- **Multi-chain balance**: < 8 seconds (queries 5 chains)

---

## 🎯 **Copy-Paste Test Suite**

Quick test - paste these one by one:

```
show balance for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on polygon
show nfts on polygon for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8
full list with images
show balance for 0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8 on multi networks
validate contract 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 on polygon
```

---

**Last Updated**: November 3, 2025  
**Wallet Used**: `0x70B2D7dBEcC2238e0d2A3159320E11D7D85dEDe8`  
**Status**: Ready for testing 🚀
