'use strict';

class TodoController {
  constructor(service) {
    this.service = service;
  }

  async listTodos(req, res) {
    const todos = await this.service.findAll();
    res.render('index', { todos });
  }

  async createTodo(req, res) {
    try {
      await this.service.create(req.body);
      res.redirect('/');
    } catch (err) {
      const todos = await this.service.findAll();
      res.render('index', { todos, error: err.message });
    }
  }

  async showEditForm(req, res) {
    const todo = await this.service.findById(req.params.id);
    if (!todo) return res.redirect('/');
    res.render('edit', { todo });
  }

  async updateTodo(req, res) {
    try {
      await this.service.update(req.params.id, req.body);
      res.redirect('/');
    } catch (err) {
      const todo = await this.service.findById(req.params.id);
      res.render('edit', { todo, error: err.message });
    }
  }

  async deleteTodo(req, res) {
    await this.service.remove(req.params.id);
    res.redirect('/');
  }

  async toggleTodo(req, res) {
    const todo = await this.service.findById(req.params.id);
    if (todo) await this.service.toggle(req.params.id, todo.completed);
    res.redirect('/');
  }
}

module.exports = TodoController;
