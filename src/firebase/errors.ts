export type SecurityRuleContext = {
    path: string;
    operation: 'get' | 'list' | 'create' | 'update' | 'delete';
    requestResourceData?: any;
};

const ERROR_MESSAGE_PREAMBLE = "FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:";

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  constructor(context: SecurityRuleContext) {
    const message = `${ERROR_MESSAGE_PREAMBLE}\n${JSON.stringify({ ...context }, null, 2)}`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}

export function isFirebaseError(error: any): error is FirestorePermissionError {
  return error instanceof Error && error.message.startsWith(ERROR_MESSAGE_PREAMBLE);
}
