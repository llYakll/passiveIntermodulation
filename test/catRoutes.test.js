const request = require('supertest');
const express = require('express');
const { Category, Product } = require('../models');
const categoryRoutes = require('../routes/api/category-routes');

jest.mock('../models');

const app = express();
app.use(express.json());
app.use('/api/categories', categoryRoutes);

describe('GET /api/categories', () => {
  // Mocked data
  const categories = [
    { id: 1, name: 'Electronics', Products: [{ id: 1, name: 'Laptop' }] },
    { id: 2, name: 'Books', Products: [{ id: 2, name: 'Novel' }] },
  ];

  // Clear mocks before each tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return categories with products and status 200', async () => {
    // Mock the resolved value of Category.findAll to return the categories data
    Category.findAll.mockResolvedValue(categories);

    // Make a GET request to the /api/categories endpoint
    const res = await request(app).get('/api/categories');

    // Assert the response status and body
    expect(res.status).toBe(200);
    expect(res.body).toEqual(categories);

    // Ensure that the Category.findAll method was called with the correct arguments
    expect(Category.findAll).toHaveBeenCalledWith({
      include: [{ model: Product }],
    });
  });

  it('should return status 500 and error message on fail', async () => {
    // Mock a database error
    const error = new Error('Database error');
    Category.findAll.mockRejectedValue(error);

    // Make a GET request to /api/categories endpoint
    const res = await request(app).get('/api/categories');

    // Assert the response status and error
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: error.message });

   
    });
  });

