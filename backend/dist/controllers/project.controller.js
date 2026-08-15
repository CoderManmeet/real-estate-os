"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.getOne = getOne;
exports.update = update;
exports.remove = remove;
const getParam_1 = require("../utils/getParam");
const project_validator_1 = require("../validators/project.validator");
const project_service_1 = require("../services/project.service");
async function create(req, res, next) {
    try {
        const input = project_validator_1.createProjectSchema.parse(req.body);
        const project = await (0, project_service_1.createProject)(input);
        res.status(201).json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
async function getOne(req, res, next) {
    try {
        const project = await (0, project_service_1.getProjectById)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
async function update(req, res, next) {
    try {
        const input = project_validator_1.updateProjectSchema.parse(req.body);
        const project = await (0, project_service_1.updateProject)((0, getParam_1.getParam)(req, 'id'), input);
        res.status(200).json({ success: true, data: project });
    }
    catch (err) {
        next(err);
    }
}
async function remove(req, res, next) {
    try {
        await (0, project_service_1.deleteProject)((0, getParam_1.getParam)(req, 'id'));
        res.status(200).json({ success: true, message: 'Project deleted' });
    }
    catch (err) {
        next(err);
    }
}
