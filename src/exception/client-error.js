class ClientError extends Error {
  constructor(message, statusCode) {
    super(message);

    // Prevents instantiation of this class
    // Rather than use ClientError, we should use the inherited class
    // For example: InvariantError, NotFoundError, etc
    if (this.constructor.name === 'ClientError') {
      throw new Error('cannot instantiate abstract class');
    }

    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}

module.exports = { ClientError };
