import { WsException } from '@nestjs/websockets';
import { ValidationPipe } from '@nestjs/common';

export const WSPipe = new ValidationPipe({
  exceptionFactory(validationErrors = []) {
      if (this.isDetailedOutputDisabled) {
          return new WsException('Bad request');
      }
      const errors = this.flattenValidationErrors(validationErrors);
      return new WsException(errors);
  }
})