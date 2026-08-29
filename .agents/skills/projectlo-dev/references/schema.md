# ProjectLo — Database Schema & Data Models Reference

This document outlines the complete PostgreSQL database schema managed through Prisma ORM in `apps/api/prisma/schema.prisma`.

---

## 1. Core Data Conventions

- **Primary Keys**: UUID strings (`@id @default(uuid())`).
- **Currency Storage**: Stored as integers in **Paise** (1 INR = 100 Paise).
  - Example: `₹1,500.00` is stored as `150000`.
- **Timestamps**: All tables include `createdAt DateTime @default(now())`, and stateful entities include `updatedAt DateTime @updatedAt`.
- **Canonical Ordering for Conversations**: `user1Id < user2Id` is enforced at the application level to ensure deterministic conversation lookups.

---

## 2. Enums

### `InventoryType`
- `DIGITAL`: Digital assets such as source code, simulation packages, final-year project reports, CAD drawings.
- `PHYSICAL`: Hardware dev kits, microcontrollers (ESP32, Arduino), compute boards (Nvidia Jetson Orin Nano, Raspberry Pi), robotic arms, sensors.

### `ProductType`
- `SALE`: Available for outright purchase.
- `RENT`: Available for per-day hardware rental.
- `BOTH`: Available for both outright purchase and rental.

### `OrderStatus`
- `PENDING`: Order placed / payment pending.
- `COMPLETED`: Order fulfilled / handed over.
- `CANCELLED`: Order cancelled.

### `ConversationStatus`
- `ACTIVE`: Active communication thread between buyer and seller.
- `COMPLETED`: Order completed; conversation thread is archived and read-only.
- `CLOSED`: Thread closed.

### `RentalStatus`
- `PENDING`: Rental requested.
- `ACTIVE`: Hardware currently in possession of renter.
- `COMPLETED`: Hardware returned in satisfactory condition.
- `CANCELLED`: Rental booking cancelled.
- `DISPUTED`: Disputed condition or late return.

### `PaymentStatus`
- `PENDING`: Transaction initiated.
- `SUCCESS`: Payment successfully captured.
- `FAILED`: Payment failed.

### `PaymentProvider`
- `RAZORPAY`: Razorpay payment gateway integration.

---

## 3. Entity Models & Relations

### `User`
Represents student buyers, sellers, and renters.
- `id`: `String` (UUID, PK)
- `email`: `String` (Unique)
- `name`: `String`
- `avatar`: `String?`
- `institution`: `String?` (e.g. University / College name)
- `department`: `String?` (e.g. "Computer Science & Robotics")
- `rating`: `Float` (Default: 5.0)
- `completedDeals`: `Int` (Default: 0)
- `createdAt`, `updatedAt`

### `Product`
Represents project codebases or hardware available on the marketplace.
- `id`: `String` (UUID, PK)
- `title`: `String`
- `description`: `String`
- `category`: `String`
- `subcategory`: `String?`
- `inventoryType`: `InventoryType` (Default: `DIGITAL`)
- `type`: `ProductType` (Default: `SALE`)
- `priceSalePaise`: `Int?`
- `priceRentPaise`: `Int?`
- `securityDepositPaise`: `Int?`
- `image`: `String?` (Supabase Storage URL)
- `status`: `String` (Default: `"Available"`, `"Sold Out"`, `"Deleted"`)
- `rating`: `Float` (Default: 5.0)
- `reviewCount`: `Int` (Default: 0)
- `sellerId`: `String` (FK -> `User.id`)

### `Conversation`
Direct peer-to-peer message thread.
- `id`: `String` (UUID, PK)
- `user1Id`: `String` (Lower UUID)
- `user2Id`: `String` (Higher UUID)
- `productId`: `String?` (FK -> `Product.id`)
- `orderId`: `String?` (FK -> `Order.id`)
- `status`: `ConversationStatus` (Default: `ACTIVE`)
- `createdAt`, `updatedAt`
- **Constraint**: `@@unique([user1Id, user2Id, productId])`

### `Message`
Individual message in a conversation.
- `id`: `String` (UUID, PK)
- `conversationId`: `String` (FK -> `Conversation.id`, onDelete: `Cascade`)
- `senderId`: `String` (FK -> `User.id`)
- `content`: `String` (Max length 2000 chars)
- `createdAt`: `DateTime`

### `Order`
Outright purchase record.
- `id`: `String` (UUID, PK)
- `buyerId`: `String` (FK -> `User.id`)
- `productId`: `String` (FK -> `Product.id`)
- `amountPaise`: `Int`
- `status`: `OrderStatus` (Default: `COMPLETED`)
- `createdAt`: `DateTime`

### `Rental`
Hardware rental contract.
- `id`: `String` (UUID, PK)
- `renterId`: `String` (FK -> `User.id`)
- `productId`: `String` (FK -> `Product.id`)
- `startDate`: `DateTime`
- `endDate`: `DateTime`
- `dailyRatePaise`: `Int`
- `totalPaidPaise`: `Int`
- `securityDepositPaise`: `Int?`
- `status`: `RentalStatus` (Default: `ACTIVE`)
- `createdAt`: `DateTime`

### `Review`
Ratings & reviews authored by peers.
- `id`: `String` (UUID, PK)
- `authorId`: `String` (FK -> `User.id`)
- `productId`: `String` (FK -> `Product.id`)
- `orderId`: `String?` (FK -> `Order.id`)
- `rentalId`: `String?` (FK -> `Rental.id`)
- `rating`: `Float`
- `comment`: `String`
- `createdAt`: `DateTime`

### `Payment`
Payment transaction audit.
- `id`: `String` (UUID, PK)
- `orderId`: `String?` (FK -> `Order.id`)
- `rentalId`: `String?` (FK -> `Rental.id`)
- `amountPaise`: `Int`
- `provider`: `PaymentProvider` (Default: `RAZORPAY`)
- `status`: `PaymentStatus` (Default: `SUCCESS`)
- `razorpayId`: `String?`
- `createdAt`: `DateTime`
