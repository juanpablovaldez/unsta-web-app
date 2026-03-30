'use strict';

const express = require('express');
const path = require('path');
const hbs = require('hbs');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/swagger/swagger.config');

const Todo = require('./src/todo/todo.model');
const TodoRepository = require('./src/todo/todo.repository');
const TodoService = require('./src/todo/todo.service');
const TodoController = require('./src/todo/todo.controller');
const TodoApiController = require('./src/todo/todo.api.controller');
const createTodoRoutes = require('./src/todo/todo.routes');
const createTodoApiRoutes = require('./src/todo/todo.api.routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/errorHandler');

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// DI wiring
const todoRepository = new TodoRepository(Todo);
const todoService = new TodoService(todoRepository);
const todoController = new TodoController(todoService);
const todoApiController = new TodoApiController(todoService);
const todoRoutes = createTodoRoutes(todoController);
const todoApiRoutes = createTodoApiRoutes(todoApiController);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/todos', todoApiRoutes);
app.use('/', todoRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
