# ProjectLo — REST API Reference

All backend endpoints are hosted on the Express server (`apps/api`, port 4000) and prefixed with `/api`.

---

## 1. Authentication

Protected endpoints require a Supabase JWT in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

When authenticated, the backend middleware attaches `req.userId` with the user's UUID.

---

## 2. Product Endpoints (`/api/products`)

### `GET /api/products`
Retrieves paginated product listings.
- **Query Parameters**:
  - `page`: Page number (default: `1`)
  - `limit`: Items per page (default: `20`, max: `50`)
  - `search`: Search substring matching `title` or `description` (case-insensitive)
  - `category`: Filter by category string
  - `type`: Filter by `ProductType` (`SALE`, `RENT`, `BOTH`)
- **Response**:
  ```json
  {
    "products": [...],
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
  ```

### `GET /api/products/categories`
Retrieves all unique categories with listing counts.
- **Response**:
  ```json
  [
    { "name": "Computer Science", "count": 14 },
    { "name": "Hardware & IoT", "count": 8 }
  ]
  ```

### `GET /api/products/my`
*(Auth Required)* Retrieves all products listed by the authenticated user.

### `GET /api/products/:id`
Retrieves full details of a specific product, including seller profile.
- **Response**: Full `Product` object with `seller` relation (`id`, `name`, `avatar`, `department`, `rating`, `completedDeals`).

### `POST /api/products`
*(Auth Required)* Creates a new project/hardware listing.
- **Request Body (JSON)**:
  - `title`: `string` (1–100 chars)
  - `description`: `string` (1–5000 chars)
  - `category`: `string`
  - `subcategory`: `string?`
  - `inventoryType`: `"DIGITAL"` | `"PHYSICAL"`
  - `type`: `"SALE"` | `"RENT"` | `"BOTH"`
  - `priceSalePaise`: `number?` (Required if type is `SALE` or `BOTH`)
  - `priceRentPaise`: `number?` (Required if type is `RENT` or `BOTH`)
  - `securityDepositPaise`: `number?`
  - `image`: `string?` (URL)
- **Response**: Created `Product` object (HTTP 201).

### `PUT /api/products/:id`
*(Auth Required)* Updates an existing product. Only the original seller can update.

### `DELETE /api/products/:id`
*(Auth Required)* Deletes a product.
- If related orders/rentals/conversations exist, performs a **soft delete** by updating `status = 'Deleted'`.
- Otherwise, performs a hard delete from the database.

---

## 3. Conversation & Messaging Endpoints

### `GET /api/conversations`
*(Auth Required)* Returns all conversation threads for the authenticated user, ordered by `updatedAt DESC`, including the last message preview and product details.

### `POST /api/conversations`
*(Auth Required)* Creates or retrieves an existing conversation thread for a product.
- **Request Body**:
  ```json
  { "productId": "uuid-string" }
  ```
- **Rules**:
  - Sellers cannot start a conversation with themselves about their own product.
  - Generates canonical participant pair `[user1Id, user2Id]` where `user1Id < user2Id`.

### `GET /api/conversations/:id/messages`
*(Auth Required)* Fetches messages in a thread.
- **Query Parameters**:
  - `cursor`: Message UUID cursor for pagination
  - `take`: Limit (default: `50`)

### `POST /api/messages`
*(Auth Required)* Sends a new message in a conversation.
- **Request Body**:
  ```json
  {
    "conversationId": "uuid-string",
    "content": "Hello, is this kit still available?"
  }
  ```
- **Validation**:
  - `content`: Non-empty string, trimmed, maximum 2000 characters.
  - Fails if the conversation status is `COMPLETED` or `CLOSED`.

### `POST /api/conversations/:id/complete-order`
*(Auth Required)* Completes the transaction associated with a conversation.
- Atomically runs a database transaction:
  1. Updates `Order.status = 'COMPLETED'`
  2. Updates `Conversation.status = 'COMPLETED'`
- Locks the conversation to read-only.
