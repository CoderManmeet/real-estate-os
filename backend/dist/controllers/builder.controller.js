"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.list = list;
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
const getParam_1 = require("../utils/getParam");
const builder_validator_1 = require("../validators/builder.validator");
const builder_service_1 = require("../services/builder.service");
async function create(req, res, next) {
    try {
        const input = builder_validator_1.createBuilderSchema.parse(req.body);
        const builder = await (0, builder_service_1.createBuilder)(input);
        res.status(201).json({ success: true, data: builder });
    }
    catch (err) {
        next(err);
    }
}
async function list(req, res, next) {
    try {
        const query = builder_validator_1.listBuildersQuerySchema.parse(req.query);
        const result = await (0, builder_service_1.listBuilders)(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const builder = await (0, builder_service_1.getBuilderById)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: builder });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = builder_validator_1.updateBuilderSchema.parse(req.body);
        const builder = await (0, builder_service_1.updateBuilder)((0, getParam_1.getParam)(req, 'id'), input);
        res.status(200).json({ success: true, data: builder });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await (0, builder_service_1.deleteBuilder)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Builder deleted' });
    }
    catch (err) {
        next(err);
    }
}
