"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
exports.prisma = global.prismaGlobal ?? new client_1.PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') {
    global.prismaGlobal = exports.prisma;
}
