const request = require('supertest');
const express = require('express');
const { Product, Category, Tag, ProductTag } = require('../models');
const productRoutes = require('../routes/api/product-routes');

jest.mock('../models');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    const products = [
      { id: 1, product_name: 'Laptop', Category: { id: 1, category_name: 'Electronics' }, Tags: [{ id: 1, tag_name: 'Tech' }] },
      { id: 2, product_name: 'Novel', Category: { id: 2, category_name: 'Books' }, Tags: [{ id: 2, tag_name: 'Literature' }] },
    ];

    it('should return all products with associated Category and Tag data', async () => {
      Product.findAll.mockResolvedValue(products);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(products);
      expect(Product.findAll).toHaveBeenCalledWith({
        include: [
          { model: Category },
          { model: Tag, through: ProductTag },
        ],
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Database error');
      Product.findAll.mockRejectedValue(error);

      const res = await request(app).get('/api/products');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Error fetching products.' });
      expect(Product.findAll).toHaveBeenCalledWith({
        include: [
          { model: Category },
          { model: Tag, through: ProductTag },
        ],
      });
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a product by id with associated Category and Tag data', async () => {
      const product = { id: 1, product_name: 'Laptop', Category: { id: 1, category_name: 'Electronics' }, Tags: [{ id: 1, tag_name: 'Tech' }] };

      Product.findByPk.mockResolvedValue(product);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(product);
      expect(Product.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: Category },
          { model: Tag, through: ProductTag },
        ],
      });
    });

    it('should return status 404 if no product is found', async () => {
      Product.findByPk.mockResolvedValue(null);

      const res = await request(app).get('/api/products/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No product found with this id!' });
      expect(Product.findByPk).toHaveBeenCalledWith('999', {
        include: [
          { model: Category },
          { model: Tag, through: ProductTag },
        ],
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Database error');
      Product.findByPk.mockRejectedValue(error);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Error fetching product.' });
      expect(Product.findByPk).toHaveBeenCalledWith('1', {
        include: [
          { model: Category },
          { model: Tag, through: ProductTag },
        ],
      });
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product and associate tags', async () => {
      const newProduct = {
        product_name: 'Basketball',
        price: 200.00,
        stock: 3,
        tagIds: [1, 2, 3, 4]
      };

      const createdProduct = { id: 1, product_name: 'Basketball', price: 200.00, stock: 3 };

      Product.create.mockResolvedValue(createdProduct);
      ProductTag.bulkCreate.mockResolvedValue([]);

      const res = await request(app).post('/api/products').send(newProduct);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(createdProduct);
      expect(Product.create).toHaveBeenCalledWith({
        product_name: 'Basketball',
        price: 200.00,
        stock: 3,
      });
      expect(ProductTag.bulkCreate).toHaveBeenCalledWith([
        { product_id: 1, tag_id: 1 },
        { product_id: 1, tag_id: 2 },
        { product_id: 1, tag_id: 3 },
        { product_id: 1, tag_id: 4 }
      ]);
    });

    it('should return status 400 and error message on failure', async () => {
      const error = new Error('Create error');
      Product.create.mockRejectedValue(error);

      const res = await request(app).post('/api/products').send({
        product_name: 'Basketball',
        price: 200.00,
        stock: 3,
        tagIds: [1, 2, 3, 4]
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Unable to create product.' });
      expect(Product.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product by its id and associate tags', async () => {
      const updatedProduct = {
        product_name: 'Basketball',
        price: 250.00,
        stock: 5,
        tagIds: [1, 2]
      };

      Product.update.mockResolvedValue([1]); // Sequelize returns the number of affected rows as [1]
      ProductTag.findAll.mockResolvedValue([
        { id: 1, tag_id: 3 },
        { id: 2, tag_id: 4 }
      ]);
      ProductTag.bulkCreate.mockResolvedValue([]);
      ProductTag.destroy.mockResolvedValue(2);

      const res = await request(app).put('/api/products/1').send(updatedProduct);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([1]);
      expect(Product.update).toHaveBeenCalledWith({
        product_name: 'Basketball',
        price: 250.00,
        stock: 5,
      }, {
        where: { id: '1' },
      });
      expect(ProductTag.findAll).toHaveBeenCalledWith({
        where: { product_id: '1' },
      });
      expect(ProductTag.destroy).toHaveBeenCalledWith({
        where: { id: [1, 2] },
      });
      expect(ProductTag.bulkCreate).toHaveBeenCalledWith([
        { product_id: '1', tag_id: 1 },
        { product_id: '1', tag_id: 2 }
      ]);
    });

    it('should return status 404 if no product is found', async () => {
      Product.update.mockResolvedValue([0]); // No rows affected

      const res = await request(app).put('/api/products/999').send({
        product_name: 'Basketball',
        price: 250.00,
        stock: 5,
        tagIds: [1, 2]
      });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No product found with this id!' });
      expect(Product.update).toHaveBeenCalledWith({
        product_name: 'Basketball',
        price: 250.00,
        stock: 5,
      }, {
        where: { id: '999' },
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Update error');
      Product.update.mockRejectedValue(error);

      const res = await request(app).put('/api/products/1').send({
        product_name: 'Basketball',
        price: 250.00,
        stock: 5,
        tagIds: [1, 2]
      });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Error updating product.' });
      expect(Product.update).toHaveBeenCalledWith({
        product_name: 'Basketball',
        price: 250.00,
        stock: 5,
      }, {
        where: { id: '1' },
      });
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product by its id and return status 200', async () => {
      Product.destroy.mockResolvedValue(1); // Sequelize returns the number of affected rows as 1

      const res = await request(app).delete('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Product deleted!' });
      expect(Product.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return status 404 if no product is found', async () => {
      Product.destroy.mockResolvedValue(0); // No rows affected

      const res = await request(app).delete('/api/products/999');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'No product found with this id!' });
      expect(Product.destroy).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });

    it('should return status 500 and error message on failure', async () => {
      const error = new Error('Delete error');
      Product.destroy.mockRejectedValue(error);

      const res = await request(app).delete('/api/products/1');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: 'Error deleting product.' });
      expect(Product.destroy).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
