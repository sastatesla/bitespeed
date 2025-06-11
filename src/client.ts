import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import eventEmitter from './utils/logging';

// Load the correct env file based on NODE_ENV
dotenv.config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
  ),
});

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (!global.prisma) {
  prisma = new PrismaClient();

  prisma
    .$connect()
    .then(() => {
      eventEmitter.emit("logging", "[Prisma] Database connection established successfully.");})
    .catch((err) => {
      eventEmitter.emit("logging", `[Prisma] Database connection error: ${err.message}`);
    });

  if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
} else {
  prisma = global.prisma;
}

export default prisma;
