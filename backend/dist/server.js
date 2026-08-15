"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: env_1.env.corsOrigin, credentials: true }));
app.use(express_1.default.json());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api', routes_1.default);
app.use(error_middleware_1.errorMiddleware);
app.listen(env_1.env.port, () => {
    console.log(`Server running on http://localhost:${env_1.env.port}`);
});
