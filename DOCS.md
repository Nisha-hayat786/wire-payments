# WirePayments Platform Documentation

Welcome to the WirePayments technical guide. This platform provides a secure, non-custodial gateway for processing payments on the Wirefluid EVM network.

## 🛠 Project Architecture

WirePayments is built on a "Trust-Minimized" architecture:
- **Smart Contracts**: Funds are settled directly on-chain via the `WirePaymentGateway` contract.
- **Security**: API keys are hashed (SHA-256) before storage. Plain-text keys are never persisted.
- **Checkout**: Mobile-first UI using EIP-681 scanning targets for pre-filled, tamper-proof transactions.

---

## 🔑 API Integration

### Base URL
`https://your-domain.com/api`

### Authentication
Include your API key as a Bearer token in the `Authorization` header.
```bash
Authorization: Bearer wp_live_...
```

### 1. Create an Invoice
`POST /invoices`

**Payload:**
```json
{
  "amount": 15.5,
  "currency": "WIRE",
  "description": "Premium Subscription",
  "metadata": {
    "order_id": "12345",
    "customer": "Alice"
  }
}
```

**Response:**
```json
{
  "id": "inv_8f2...",
  "status": "pending",
  "checkout_url": "https://your-domain.com/checkout/inv_8f2..."
}
```

---

## 📱 Checkout Features

### QR Scan-to-Pay (EIP-681)
Our QR codes use the Ethereum Request URI standard. When scanned with a mobile wallet (MetaMask, Rainbow), it automatically configures:
1. **Destination**: The WirePaymentGateway contract.
2. **Chain**: Wirefluid Testnet (92533).
3. **Value**: The exact invoice amount (in WEI).

This prevents users from accidentally (or intentionally) changing the payment amount in their wallet UI.

### Partial Payments
If a user sends less than the total invoice amount:
- The system flags the invoice as `partially_paid`.
- The `amount_paid` is recorded in the invoice metadata.
- A status update is triggered for the merchant.

---

## 🔐 Administrative Access

The platform includes a dedicated **Admin Panel** (`/admin`) for platform owners. Access is restricted via Supabase Auth (Email/Password) and enforced through PostgreSQL Row-Level Security (RLS).
