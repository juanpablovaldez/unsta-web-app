'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');

let mongod;
let app;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = require('../app');
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

// Helper to create a todo via the API
async function createTodo(title = 'Test todo') {
  const res = await request(app).post('/api/todos').send({ title });
  return res.body.data;
}

// ─── GET /api/todos ───────────────────────────────────────────────────────────

describe('GET /api/todos', () => {
  it('returns empty array when no todos exist', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it('returns all todos', async () => {
    await createTodo('First');
    await createTodo('Second');
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });
});

// ─── POST /api/todos ──────────────────────────────────────────────────────────

describe('POST /api/todos', () => {
  it('creates a todo and returns 201', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'Buy groceries' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Buy groceries');
    expect(res.body.data.completed).toBe(false);
    expect(res.body.data._id).toBeDefined();
  });

  it('trims whitespace from title', async () => {
    const res = await request(app).post('/api/todos').send({ title: '  Trimmed  ' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Trimmed');
  });

  it('returns 400 when title is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Title is required.');
  });

  it('returns 400 when title is empty string', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error.statusCode).toBe(400);
  });

  it('returns 400 when title exceeds 200 characters', async () => {
    const res = await request(app).post('/api/todos').send({ title: 'a'.repeat(201) });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Title must be 200 characters or fewer.');
  });
});

// ─── GET /api/todos/:id ───────────────────────────────────────────────────────

describe('GET /api/todos/:id', () => {
  it('returns a todo by ID', async () => {
    const created = await createTodo('Find me');
    const res = await request(app).get(`/api/todos/${created._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Find me');
  });

  it('returns 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/todos/${fakeId}`);
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Todo not found');
  });

  it('returns 400 for invalid ID format', async () => {
    const res = await request(app).get('/api/todos/not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Invalid ID format');
  });
});

// ─── PUT /api/todos/:id ───────────────────────────────────────────────────────

describe('PUT /api/todos/:id', () => {
  it('updates title and completed', async () => {
    const created = await createTodo('Original');
    const res = await request(app)
      .put(`/api/todos/${created._id}`)
      .send({ title: 'Updated', completed: true });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated');
    expect(res.body.data.completed).toBe(true);
  });

  it('returns 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/todos/${fakeId}`)
      .send({ title: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for validation error', async () => {
    const created = await createTodo('Original');
    const res = await request(app)
      .put(`/api/todos/${created._id}`)
      .send({ title: '' });
    expect(res.status).toBe(400);
  });
});

// ─── DELETE /api/todos/:id ────────────────────────────────────────────────────

describe('DELETE /api/todos/:id', () => {
  it('deletes a todo and returns 204', async () => {
    const created = await createTodo('Delete me');
    const res = await request(app).delete(`/api/todos/${created._id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).delete(`/api/todos/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

// ─── PATCH /api/todos/:id/toggle ─────────────────────────────────────────────

describe('PATCH /api/todos/:id/toggle', () => {
  it('toggles completed from false to true', async () => {
    const created = await createTodo('Toggle me');
    expect(created.completed).toBe(false);
    const res = await request(app).patch(`/api/todos/${created._id}/toggle`);
    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(true);
  });

  it('toggles completed from true to false', async () => {
    const created = await createTodo('Toggle me');
    await request(app).patch(`/api/todos/${created._id}/toggle`);
    const res = await request(app).patch(`/api/todos/${created._id}/toggle`);
    expect(res.status).toBe(200);
    expect(res.body.data.completed).toBe(false);
  });

  it('returns 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).patch(`/api/todos/${fakeId}/toggle`);
    expect(res.status).toBe(404);
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────

describe('404 handler', () => {
  it('returns JSON 404 for unknown /api routes', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.statusCode).toBe(404);
  });
});
