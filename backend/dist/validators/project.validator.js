"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    builderId: zod_1.z.string().uuid('Invalid builder id'),
    name: zod_1.z.string().min(2, 'Project name is required'),
    description: zod_1.z.string().optional(),
    city: zod_1.z.string().min(2, 'City is required'),
    state: zod_1.z.string().min(2, 'State is required'),
    launchDate: zod_1.z.string().datetime().optional(),
    possessionDate: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['UPCOMING', 'ONGOING', 'COMPLETED']).optional(),
});
exports.updateProjectSchema = exports.createProjectSchema.partial().omit({ builderId: true });
