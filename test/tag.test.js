const request = require('supertest');
const express = require('express');
const { Tag, Product, ProductTag } = require('../models');
const tagRoutes = require('../routes/api/tag-routes');

jest.mock('../models');

const app = express();
app.use(express.json());
app.use('/api/tags', tagRoutes);

describe('GET /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all tags with products and status 200', async () => {
    const tags = [
      { id: 1, tag_name: 'rock music', Products: [{ id: 1, product_name: 'Guitar' }] },
      { id: 2, tag_name: 'pop music', Products: [{ id: 2, product_name: 'Microphone' }] },
    ];

    Tag.findAll.mockResolvedValue(tags);

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(tags);
    expect(Tag.findAll).toHaveBeenCalledWith({
      include: [{ model: Product, through: ProductTag }],
    });
  });

  it('should return status 500 and error message on failure', async () => {
    const error = new Error('Database error');
    Tag.findAll.mockRejectedValue(error);

    const res = await request(app).get('/api/tags');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error fetching tags.' });
  });
});

describe('GET /api/tags/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a single tag with products and status 200', async () => {
    const tag = { id: 1, tag_name: 'rock music', Products: [{ id: 1, product_name: 'Guitar' }] };

    Tag.findByPk.mockResolvedValue(tag);

    const res = await request(app).get('/api/tags/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(tag);
    expect(Tag.findByPk).toHaveBeenCalledWith('1', {
      include: [{ model: Product, through: ProductTag }],
    });
  });

  it('should return status 404 if no tag is found', async () => {
    Tag.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/tags/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'No tag found with this id!' });
  });

  it('should return status 500 and error message on failure', async () => {
    const error = new Error('Database error');
    Tag.findByPk.mockRejectedValue(error);

    const res = await request(app).get('/api/tags/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error fetching tag.' });
  });
});

describe('POST /api/tags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new tag and return status 200', async () => {
    const newTag = { id: 3, tag_name: 'new tag' };
    Tag.create.mockResolvedValue(newTag);

    const res = await request(app).post('/api/tags').send({ tag_name: 'new tag' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(newTag);
    expect(Tag.create).toHaveBeenCalledWith({ tag_name: 'new tag' });
  });

  it('should return status 400 and error message on failure', async () => {
    const error = new Error('Unable to create tag');
    Tag.create.mockRejectedValue(error);

    const res = await request(app).post('/api/tags').send({ tag_name: 'new tag' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Unable to create tag.' });
  });
});

describe('PUT /api/tags/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update a tag and return status 200', async () => {
    Tag.update.mockResolvedValue([1]);

    const res = await request(app).put('/api/tags/1').send({ tag_name: 'updated tag' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual([1]);
    expect(Tag.update).toHaveBeenCalledWith({ tag_name: 'updated tag' }, { where: { id: '1' } });
  });

  it('should return status 404 if no tag is found', async () => {
    Tag.update.mockResolvedValue([0]);

    const res = await request(app).put('/api/tags/999').send({ tag_name: 'updated tag' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'No tag found with this id!' });
  });

  it('should return status 500 and error message on failure', async () => {
    const error = new Error('Error updating tag');
    Tag.update.mockRejectedValue(error);

    const res = await request(app).put('/api/tags/1').send({ tag_name: 'updated tag' });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error updating tag.' });
  });
});

describe('DELETE /api/tags/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a tag and return status 200', async () => {
    Tag.destroy.mockResolvedValue(1);

    const res = await request(app).delete('/api/tags/1');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Tag deleted!' });
    expect(Tag.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return status 404 if no tag is found', async () => {
    Tag.destroy.mockResolvedValue(0);

    const res = await request(app).delete('/api/tags/999');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'No tag found with this id!' });
  });

  it('should return status 500 and error message on failure', async () => {
    const error = new Error('Error deleting tag');
    Tag.destroy.mockRejectedValue(error);

    const res = await request(app).delete('/api/tags/1');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error deleting tag.' });
  });
});