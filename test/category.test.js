const request = require('supertest');
const express = require('express');
const { Category, Product } = require('../models');
const categoryRoutes = require('../routes/api/category-routes');

jest.mock('../models');

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('Category Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/categories', () => {
    const categories = [
      { id: 1, category_name: 'Shirts', Products: [{ id: 1, product_name: 'T-Shirt' }] },
      { id: 2, category_name: 'Shorts', Products: [{ id: 2, product_name: 'Shorts' }] },
    ];

    it('should return all categories with associated products', async () => {
      Category.findAll.mockResolvedValue(categories);

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(categories);
      expect(Category.findAll).toHaveBeenCalledWith({
        include: [{ model: Product }],
      });
    });

    it('should return 500 if there is a server error', async () => {
      const error = new Error('Error fetching categories.');
      Category.findAll.mockRejectedValue(error);

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: error.message });
      expect(Category.findAll).toHaveBeenCalledWith({
        include: [{ model: Product }],
      });
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should return a category with its products and status 200', async () => {
      const category = { id: 1, category_name: 'Shirts', Products: [{ id: 1, product_name: 'T-Shirt' }] };

      Category.findByPk.mockResolvedValue(category);

      const res = await request(app).get('/api/categories/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(category);
      expect(Category.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: Product }],
      });
    });

    it('should return status 404 if no category is found', async () => {
      Category.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/categories/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No category found with this id!' });
      expect(Category.findByPk).toHaveBeenCalledWith('999', {
        include: [{ model: Product }],
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Error fetching category.');
      Category.findByPk.mockRejectedValue(error);

      const res = await request(app).get('/api/categories/1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: error.message });
      expect(Category.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: Product }],
      });
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category by its id and return status 200', async () => {
      const updatedCategory = { category_name: 'Updated Shirts' };

      Category.update.mockResolvedValue([1]);

      const res = await request(app).put('/api/categories/1').send(updatedCategory);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([1]);
      expect(Category.update).toHaveBeenCalledWith(updatedCategory, {
        where: { id: '1' },
      });
    });

    it('should return status 404 if no category is found', async () => {
      Category.update.mockResolvedValue([0]);

      const res = await request(app).put('/api/categories/999').send({ category_name: 'Updated Electronics' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No category found with this id!' });
      expect(Category.update).toHaveBeenCalledWith({ category_name: 'Updated Electronics' }, {
        where: { id: '999' },
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Error updating category.');
      Category.update.mockRejectedValue(error);

      const res = await request(app).put('/api/categories/1').send({ category_name: 'Updated Electronics' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: error.message });
      expect(Category.update).toHaveBeenCalledWith({ category_name: 'Updated Electronics' }, {
        where: { id: '1' },
      });
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category by its id and return status 200', async () => {
      Category.destroy.mockResolvedValue(1);

      const res = await request(app).delete('/api/categories/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Category deleted!' });
      expect(Category.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return status 404 if no category is found', async () => {
      Category.destroy.mockResolvedValue(0);

      const res = await request(app).delete('/api/categories/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No category found with this id!' });
      expect(Category.destroy).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Error deleting category.');
      Category.destroy.mockRejectedValue(error);

      const res = await request(app).delete('/api/categories/1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: error.message });
      expect(Category.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
