"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clientController = __importStar(require("../controllers/client.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
// import * as clientController from '../controllers/client.controller';
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.get('/', clientController.list);
router.post('/', clientController.create);
router.get('/:id', clientController.getOne);
router.patch('/:id', clientController.update);
router.delete('/:id', clientController.remove);
router.post('/:id/requirements', clientController.addRequirement);
router.post('/:id/notes', clientController.addNote);
router.post('/:id/timeline', clientController.addTimelineEvent);
router.post('/:id/favorites', clientController.addFavorite);
router.delete('/:id/favorites/:propertyId', clientController.removeFavorite);
router.post('/:id/shared-properties', clientController.shareProperty);
router.get('/:id/portal-link', clientController.getPortalLink);
exports.default = router;
