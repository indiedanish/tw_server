const { PrismaClient } = require('@prisma/client');

// Create a singleton instance of PrismaClient
let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}

prisma = global.prisma;

module.exports = prisma;