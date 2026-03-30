'use strict';

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

  async create(data) {
    this._validate(data);
    return this.repository.create({ title: data.title.trim() });
  }

  async update(id, data) {
    this._validate(data);
    return this.repository.update(id, {
      title: data.title.trim(),
      completed: data.completed === 'on',
    });
  }

  toggle(id, completed) {
    return this.repository.update(id, { completed: !completed });
  }

  remove(id) {
    return this.repository.remove(id);
  }

  _validate(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw { message: 'Title is required.' };
    }
    if (data.title.trim().length > 200) {
      throw { message: 'Title must be 200 characters or fewer.' };
    }
  }
}

module.exports = TodoService;
