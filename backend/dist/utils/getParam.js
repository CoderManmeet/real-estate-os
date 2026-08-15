"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = getParam;
/**
 * Express 5's types allow route params to be string | string[]
 * (to support array-style paths). For a normal "/:id" route this
 * is always a single string at runtime — this helper asserts that
 * safely in one place instead of casting everywhere params are used.
 */
function getParam(req, key) {
    const value = req.params[key];
    return Array.isArray(value) ? value[0] : value;
}
