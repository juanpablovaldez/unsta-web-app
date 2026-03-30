'use strict';

const express = require('express');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');

const Todo = require('./src/todo/todo.model');
const TodoRepository = require('./src/todo/todo.repository');
const TodoService = require('./src/todo/todo.service');
const TodoController = require('./src/todo/todo.controller');
const createTodoRoutes = require('./src/todo/todo.routes');

const app = express();

// View engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Register partials synchronously to avoid race conditions
const partialsDir = path.join(__dirname, 'views', 'partials');
if (fs.existsSync(partialsDir)) {
  fs.readdirSync(partialsDir).forEach((file) => {
    if (file.endsWith('.hbs')) {
      const name = file.replace('.hbs', '');
      const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
      hbs.registerPartial(name, content);
    }
  });
}

// Middleware
app.use(express.urlencoded({ extended: false }));

// DI wiring
const todoRepository = new TodoRepository(Todo);
const todoService = new TodoService(todoRepository);
const todoController = new TodoController(todoService);
const todoRoutes = createTodoRoutes(todoController);

// Routes
app.use('/', todoRoutes);

module.exports = app;
