'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description: 'REST API for managing todos',
    },
    servers: [{ url: '/api' }],
    components: {
      schemas: {
        Todo: {
          type: 'object',
          properties: {
            _id:       { type: 'string', example: '64b1f2c3d4e5f6a7b8c9d0e1' },
            title:     { type: 'string', maxLength: 200, example: 'Buy groceries' },
            completed: { type: 'boolean', example: false },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateTodo: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', maxLength: 200, example: 'Buy groceries' },
          },
        },
        UpdateTodo: {
          type: 'object',
          properties: {
            title:     { type: 'string', maxLength: 200, example: 'Buy groceries' },
            completed: { type: 'boolean', example: true },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message:    { type: 'string', example: 'Todo not found' },
                statusCode: { type: 'integer', example: 404 },
              },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../todo/todo.api.routes.js')],
};

module.exports = swaggerJsdoc(options);
