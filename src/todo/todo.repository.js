'use strict';

class TodoRepository {
  constructor(model) {
    this.model = model;
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 });
  }

  findById(id) {
    return this.model.findById(id);
  }

  create(data) {
    return this.model.create(data);
  }

  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  remove(id) {
    return this.model.findByIdAndDelete(id);
  }
}

module.exports = TodoRepository;
