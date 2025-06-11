# Identity API

A robust Node.js (Express + Prisma) API for contact identity management, supporting contact linking and deduplication by email and phone number.

## Features

- **Identify endpoint**: Accepts email and/or phone number, finds or creates contact, and links contacts with shared identifiers.
- **Contact linking**: Automatically merges records as "primary" and "secondary" based on creation time.
- **Single source of truth**: Always returns the oldest contact as the primary, with all related emails and phone numbers.
- **Prisma ORM**: PostgreSQL schema for efficient self-linking and deduplication.
- **Validation**: Uses Joi for environment and input validation.

## Quick Start

### 1. Clone & Install

```sh
git clone <repo-url>
cd befatch-backend
npm install
```

### 2. Configure Environment

Create a `.env` file in the project root with at least:

```
NODE_ENV=development
PORT=4000

# Database (PostgreSQL) to generate runtime url via provider factory for using it at services
DB_USER=youruser
DB_PASSWORD=yourpass
DB_HOST=localhost
MAIN_DB_NAME=yourdbname

//this is for prisma operations
DATABASE_URL="postgresql://youruser:yourpass@localhost:5432/yourdbname"
JWT_SECRET=yourjwtsecret
```

> Adjust values as needed for your local setup.

### 3. Run Prisma Migrations

```sh
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the Server

```sh
npm run dev
# or
npm start
```

## API Usage

### POST `https://bitespeed-l2ag.onrender.com/v1/bitespeed/identity`

Identify a contact by email and/or phone number. Links contacts if identifiers overlap.

#### Request Body

```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```

#### Response

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

> The response lists all unique emails and phone numbers merged for the identified user, with the primary and secondary IDs.


---
Postman testing
![Screenshot from 2025-06-11 21-09-31](https://github.com/user-attachments/assets/d6fb6d6f-d65e-427b-9b98-dd84b86d29f1)
