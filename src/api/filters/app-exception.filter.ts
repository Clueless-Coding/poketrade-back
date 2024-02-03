import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { AppException, AppAuthException, AppConflictException, AppEntityNotFoundException, AppInternalException, AppValidationException } from 'src/core/exceptions';

@Catch(AppException)
export class AppExceptionFilter extends BaseExceptionFilter<AppException> {
  catch(exception: AppException, host: ArgumentsHost) {
    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof AppEntityNotFoundException) {
      httpStatus = HttpStatus.NOT_FOUND;
    } else if (exception instanceof AppConflictException) {
      httpStatus = HttpStatus.CONFLICT;
    } else if (exception instanceof AppValidationException) {
      httpStatus = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof AppAuthException) {
      httpStatus = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof AppInternalException) {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    super.catch(new HttpException(exception.message, httpStatus), host);
  }
}
