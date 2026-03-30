'use strict';

const { ValidationError, NotFoundError } = require('../errors');

class TodoService {
  constructor(repository) {
    this.repository = repository;
  }

  findAll() {
    return this.repository.findAll();
  }

  findById(id) {
    return this.repository.findById(id);
  }

  async findByIdOrFail(id) {
    const todo = await this.repository.findById(id);
    if (!todo) throw new NotFoundError('Todo not found');
    return todo;
  }

  async create(data) {
    this._validate(data);
    return this.repository.create({ title: data.title.trim() });
  }

  async update(id, data) {
    await this.findByIdOrFail(id);
    this._validate(data);
    const completed = typeof data.completed === 'boolean' ? data.completed : false;
    return this.repository.update(id, {
      title: data.title.trim(),
      completed,
    });
  }

  toggle(id, completed) {
    return this.repository.update(id, { completed: !completed });
  }

  async remove(id) {
    await this.findByIdOrFail(id);
    return this.repository.remove(id);
  }

  _validate(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Title is required.');
    }
    if (data.title.trim().length > 200) {
      throw new ValidationError('Title must be 200 characters or fewer.');
    }
  }
}

module.exports = TodoService;
