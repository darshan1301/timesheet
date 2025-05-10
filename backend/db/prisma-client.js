const { PrismaClient } = require("@prisma/client");
// Prevent multiple instances of Prisma Client in development
let prisma;

// if (process.env.NODE_ENV === "production") {
//   prisma = new PrismaClient();
// } else {
//   // In development, use a global variable to maintain a singleton
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }
prisma = new PrismaClient();

module.exports = prisma;
