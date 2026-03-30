'use strict';

class TodoApiController {
  constructor(service) {
    this.service = service;
  }

  async list(req, res) {
    const todos = await this.service.findAll();
    res.json({ data: todos });
  }

  async getOne(req, res) {
    const todo = await this.service.findByIdOrFail(req.params.id);
    res.json({ data: todo });
  }

  async create(req, res) {
    const todo = await this.service.create(req.body);
    res.status(201).json({ data: todo });
  }

  async update(req, res) {
    const todo = await this.service.update(req.params.id, req.body);
    res.json({ data: todo });
  }

  async remove(req, res) {
    await this.service.remove(req.params.id);
    res.status(204).end();
  }

  async toggle(req, res) {
    const todo = await this.service.findByIdOrFail(req.params.id);
    const updated = await this.service.toggle(req.params.id, todo.completed);
    res.json({ data: updated });
  }
}

module.exports = TodoApiController;
