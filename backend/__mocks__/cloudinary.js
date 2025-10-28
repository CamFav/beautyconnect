const { PassThrough } = require("stream");

module.exports = {
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: "https://mock.cloudinary/test.jpg",
        public_id: "mocked_public_id",
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),

      upload_stream: jest.fn((options, callback) => {
        const stream = new PassThrough();
        process.nextTick(() => {
          callback(null, {
            secure_url: "https://mock.cloudinary.com/avatar.jpg",
            public_id: "mocked_public_id",
          });
        });
        return stream;
      }),
    },
  },
};
