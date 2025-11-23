# API Documentation

Sample usage of common endpoints

Base URL: `http://localhost:3000`

---

## Health Check

### GET /health
Health status

```bash
curl -X GET http://localhost:3000/health
```

### GET /healthz
Alternative status

```bash
curl -X GET http://localhost:3000/healthz
```

---

## Merchants

### POST /merchants/register
Creates a new merchant, and also adds a "default" cashier

```bash
curl -X POST http://localhost:3000/merchants/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@example.com",
    "password": "password123",
    "business_name": "My Megacorporation",
    "wallets": [
      {
        "network": "polygon",
        "address": "0x1234567890123456789012345678901234567890",
        "tokens": ["USDC", "USDT"]
      }
    ]
  }'
```

### GET /merchants/:email
Fetch merchant by email

```bash
curl -X GET http://localhost:3000/merchants/merchant@example.com
```

### GET /merchants/address/:address
Fetch merchant by wallet address (0x...)

```bash
curl -X GET http://localhost:3000/merchants/address/0x1234567890123456789012345678901234567890
```

---

## Cashiers

### POST /cashiers
Creates a cashier. Must provide menos at least one of: `merchantId`, `merchantAddress`, or `merchantEmail`

```bash
# Using merchantEmail
curl -X POST http://localhost:3000/cashiers \
  -H "Content-Type: application/json" \
  -d '{
    "merchantEmail": "merchant@example.com",
    "name": "Secondary cashier",
    "status": "enabled"
  }'curl
```

```bash
# Using merchantId
curl -X POST http://localhost:3000/cashiers \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "507f1f77bcf86cd799439011",
    "name": "VIP line",
    "status": "enabled"
  }'
```

```bash
# Using merchantAddress
curl -X POST http://localhost:3000/cashiers \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress": "0x1234567890123456789012345678901234567890",
    "name": "Pleb point"
  }'
```

### GET /cashiers/:uuid
Retrieves cashier by UUID

```bash
curl -X GET http://localhost:3000/cashiers/1eb5c298-b0eb-4032-97a5-8ad9d47b249f
```

### GET /cashiers/merchant/:merchantId
Get all cashiers of a merchant

```bash
curl -X GET http://localhost:3000/cashiers/merchant/507f1f77bcf86cd799439011
```

### GET /cashiers/:uuid/details
Get all cashier details (includes merchant info and payments)

```bash
curl -X GET http://localhost:3000/cashiers/1eb5c298-b0eb-4032-97a5-8ad9d47b249f/details
```

---

## Payments

### POST /payments
Creates a payment. Requires cashierId (UUID)

```bash
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "cashierId": "1eb5c298-b0eb-4032-97a5-8ad9d47b249f",
    "amount": 123.45,
    "token": "USDC",
    "network": "polygon"
  }'
```

### GET /payment/:uuid
Get a payment by its UUID

```bash
curl -X GET http://localhost:3000/payment/507f1f77bcf86cd799439011
```

### GET /payments/:merchantId
Retrieves all merchant payments merchant

```bash
curl -X GET http://localhost:3000/payments/507f1f77bcf86cd799439011
```

### PATCH /payment/:uuid
Updates payment status. Valid values are: `pending`, `consolidated` (paid), `failed`

```bash
curl -X PATCH http://localhost:3000/payment/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "consolidated"
  }'
```


## Notes

- all endpoints retrieves a JSON
- error format: `{"error": "error message"}`
- Cashier UUIDs are generated automatically
- payments and merchants IDs are MongoDB's objectIds

