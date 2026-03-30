'use strict';

const express = require('express');

function createTodoRoutes(controller) {
  const router = express.Router();

  router.get('/', controller.listTodos.bind(controller));
  router.post('/', controller.createTodo.bind(controller));
  router.get('/:id/edit', controller.showEditForm.bind(controller));
  router.post('/:id/update', controller.updateTodo.bind(controller));
  router.post('/:id/delete', controller.deleteTodo.bind(controller));
  router.post('/:id/toggle', controller.toggleTodo.bind(controller));

  return router;
}

module.exports = createTodoRoutes;
