/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus } from '@nestjs/common';

export class ResponseHandler {
  /**
   * Standardizes a successful API response.
   *
   * @param data - The data to include in the response.
   *
   * @returns An object representing a successful response.
   */
  static success(data: any) {
    return {
      success: true,
      data,
    };
  }

  /**
   * Standardizes an error API response by throwing an HttpException.
   *
   * @param message - The error message to include in the response.
   * @param status - The HTTP status code for the error (default is 400).
   *
   * @throws HttpException with the standardized error response.
   */
  static error(
    message: string,
    status: number = HttpStatus.BAD_REQUEST,
    errorFields: any = [],
  ) {
    if (errorFields.length > 0) {
      throw new HttpException(
        {
          success: false,
          message,
          errorFields,
        },
        status,
      );
    }

    throw new HttpException(
      {
        success: false,
        message,
      },
      status,
    );
  }

  /**
   * Handles both success and error responses in a standardized way.
   *
   * @param data - The data to include in the response (default is null).
   * @param isError - Flag indicating if the response is an error (default is false).
   * @param message - The error message to include if it's an error (default is 'Error occurred').
   * @param status - The HTTP status code for the error (default is 400).
   *
   * @returns An object representing either a successful or error response.
   */
  static handle(
    data: any = null,
    isError: boolean = false,
    message: string = 'Error occurred',
    status: number = HttpStatus.BAD_REQUEST,
    errorFields: any = [],
  ) {
    if (isError) {
      return this.error(message, status, errorFields);
    }
    return this.success(data);
  }
}
