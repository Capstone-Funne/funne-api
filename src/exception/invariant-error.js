import { ClientError } from './client-error.js';

export class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = 'InvariantError';
  }
}
