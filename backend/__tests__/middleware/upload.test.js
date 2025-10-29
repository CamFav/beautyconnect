const upload = require('../../middleware/upload');

describe('Middleware - upload', () => {
  it('exposes multer methods (single/array/fields)', () => {
    expect(upload).toBeDefined();
    expect(typeof upload.single).toBe('function');
    expect(typeof upload.array).toBe('function');
    expect(typeof upload.fields).toBe('function');
  });
});
