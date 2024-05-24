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
      { id: 1, name: 'Electronics', Products: [{ id: 1, name: 'Laptop' }] },
      { id: 2, name: 'Books', Products: [{ id: 2, name: 'Novel' }] },
    ];

    it('should return categories with products and status 200', async () => {
      
      Category.findAll.mockResolvedValue(categories);

      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(categories);
      expect(Category.findAll).toHaveBeenCalledWith({
        include: [{ model: Product }],
      });
    });

    it('should return status 500 and error message on failure', async () => {
      
      const error = new Error('Database error');
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
      const category = { id: 1, name: 'Electronics', Products: [{ id: 1, name: 'Laptop' }] };

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
      const error = new Error('Database error');
      Category.findByPk.mockRejectedValue(error);

      const res = await request(app).get('/api/categories/1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: error.message });
      expect(Category.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: Product }],
      });
    });
  });
});