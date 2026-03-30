'use strict';

const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');

function createTodoRoutes(controller) {
  const router = express.Router();

  router.get('/', asyncHandler(controller.listTodos.bind(controller)));
  router.post('/', asyncHandler(controller.createTodo.bind(controller)));
  router.get('/:id/edit', asyncHandler(controller.showEditForm.bind(controller)));
  router.post('/:id/update', asyncHandler(controller.updateTodo.bind(controller)));
  router.post('/:id/delete', asyncHandler(controller.deleteTodo.bind(controller)));
  router.post('/:id/toggle', asyncHandler(controller.toggleTodo.bind(controller)));

  return router;
}

module.exports = createTodoRoutes;
