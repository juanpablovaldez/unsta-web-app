'use strict';

class TodoController {
  constructor(service) {
    this.service = service;
  }

  async listTodos(req, res) {
    const todos = await this.service.findAll();
    res.render('index', { todos });
  }

  async createTodo(req, res, next) {
    try {
      await this.service.create(req.body);
      res.redirect('/');
    } catch (err) {
      if (err.isOperational) {
        const todos = await this.service.findAll();
        return res.render('index', { todos, error: err.message });
      }
      next(err);
    }
  }

  async showEditForm(req, res) {
    const todo = await this.service.findByIdOrFail(req.params.id);
    res.render('edit', { todo });
  }

  async updateTodo(req, res, next) {
    try {
      const completed = req.body.completed === 'on';
      await this.service.update(req.params.id, { ...req.body, completed });
      res.redirect('/');
    } catch (err) {
      if (err.isOperational) {
        const todo = await this.service.findById(req.params.id);
        return res.render('edit', { todo, error: err.message });
      }
      next(err);
    }
  }

  async deleteTodo(req, res) {
    await this.service.remove(req.params.id);
    res.redirect('/');
  }

  async toggleTodo(req, res) {
    const todo = await this.service.findByIdOrFail(req.params.id);
    await this.service.toggle(req.params.id, todo.completed);
    res.redirect('/');
  }
}

module.exports = TodoController;
