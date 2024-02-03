export abstract class AppException extends Error {}

export class AppEntityNotFoundException extends AppException {}
export class AppValidationException extends AppException {}
export class AppAuthException extends AppException {}
export class AppConflictException extends AppException {}
export class AppInternalException extends AppException {}
