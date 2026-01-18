# 📚 API Documentation

Base URL: `http://localhost:5000/api`

## 🔐 Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+6281234567890"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer {token}
```

### Refresh Token

```http
POST /auth/refresh
Authorization: Bearer {refreshToken}
```

## 📦 Products

### Get All Products

```http
GET /products
Query Parameters:
  page=1
  limit=20
  category=front-loading
  brand=samsung
  minPrice=1000000
  maxPrice=10000000
  sort=price_asc|price_desc|newest|popular
  search=mesin+cuci
```

### Get Single Product

```http
GET /products/{id}
```

### Create Product (Admin)

```http
POST /products
Authorization: Bearer {token}
Content-Type: multipart/form-data

name: Samsung Front Loading 8KG
description: Mesin cuci Samsung...
price: 4500000
categoryId: cat_123
// plus images and specifications
```

### Update Product (Admin)

```http
PUT /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 4200000,
  "stock": 10
}
```

### Delete Product (Admin)

```http
DELETE /products/{id}
Authorization: Bearer {token}
```

## 🛒 Cart

### Get Cart

```http
GET /cart
Authorization: Bearer {token}
```

### Add to Cart

```http
POST /cart/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_123",
  "quantity": 2,
  "variantId": "var_456" // optional
}
```

### Update Cart Item

```http
PUT /cart/update/{cartItemId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart

```http
DELETE /cart/remove/{cartItemId}
Authorization: Bearer {token}
```

### Clear Cart

```http
DELETE /cart/clear
Authorization: Bearer {token}
```

## 📋 Orders

### Create Order

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "addressId": "addr_123",
  "paymentMethod": "BANK_TRANSFER",
  "shippingMethod": "JNE_REG",
  "notes": "Please deliver before 5 PM",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 1,
      "variantId": "var_456"
    }
  ]
}
```

### Get User Orders

```http
GET /orders
Authorization: Bearer {token}
Query Parameters:
  page=1
  limit=10
  status=processing
```

### Get Order Details

```http
GET /orders/{id}
Authorization: Bearer {token}
```

### Cancel Order

```http
PUT /orders/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

## 💳 Payments

### Process Payment

```http
POST /payments/process
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "ord_123",
  "method": "BANK_TRANSFER",
  "bankCode": "bca",
  "amount": 4500000
}
```

### Upload Payment Proof

```http
POST /payments/{id}/proof
Authorization: Bearer {token}
Content-Type: multipart/form-data

// file: payment_proof.jpg
```

### Verify Payment (Admin)

```http
PUT /payments/{id}/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "verified": true,
  "notes": "Payment received"
}
```

## 👤 User Profile

### Get Profile

```http
GET /users/profile
Authorization: Bearer {token}
```

### Update Profile

```http
PUT /users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+628987654321"
}
```

### Change Password

```http
PUT /users/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

### Get Addresses

```http
GET /users/addresses
Authorization: Bearer {token}
```

### Add Address

```http
POST /users/addresses
Authorization: Bearer {token}
Content-Type: application/json

{
  "label": "Home",
  "recipientName": "John Doe",
  "phone": "+6281234567890",
  "addressLine1": "Jl. Sudirman No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postalCode": "12190",
  "isDefault": true
}
```

## ⭐ Reviews

### Create Review

```http
POST /reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "prod_123",
  "orderItemId": "item_456",
  "rating": 5,
  "title": "Great product!",
  "comment": "Very efficient and quiet",
  "images": ["url1", "url2"]
}
```

### Get Product Reviews

```http
GET /products/{id}/reviews
Query Parameters:
  page=1
  limit=10
  rating=5
  sort=newest|helpful
```

### Vote Review

```http
POST /reviews/{id}/vote
Authorization: Bearer {token}
Content-Type: application/json

{
  "helpful": true
}
```

## 🎯 Admin Endpoints

### Dashboard Stats

```http
GET /admin/dashboard/stats
Authorization: Bearer {token}
```

### Get All Users

```http
GET /admin/users
Authorization: Bearer {token}
Query Parameters:
  page=1
  limit=20
  role=customer
  search=john
```

### Update Order Status

```http
PUT /admin/orders/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "SHIPPED",
  "trackingNumber": "JNE123456789",
  "notes": "Package shipped"
}
```

### Get Sales Report

```http
GET /admin/reports/sales
Authorization: Bearer {token}
Query Parameters:
  startDate=2024-01-01
  endDate=2024-01-31
  groupBy=day|week|month
```

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## 🔐 Authentication Headers

```http
Authorization: Bearer {access_token}
```

## 📝 Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Internal Server Error

## 🐛 Error Codes

- `AUTH_ERROR`: Authentication failed
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource conflict
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## 🔄 Webhook Events

### Order Events

- `order.created`
- `order.updated`
- `order.cancelled`
- `order.delivered`

### Payment Events

- `payment.created`
- `payment.completed`
- `payment.failed`
- `payment.refunded`

### Webhook Format

```json
{
  "event": "order.created",
  "data": {},
  "timestamp": "2024-01-01T00:00:00Z",
  "signature": "sha256-hash"
}
```
