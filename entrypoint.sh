#!/bin/sh

echo "Running Prisma DB Push..."
npx prisma db push

echo "Running Prisma migration..."
npx prisma migrate deploy

echo "Starting Node Server..."
npm run start