import type { AuthenticatedUser } from './database';

/**
 * Augment the Express `Request` interface so that TypeScript knows about
 * the `user` property injected by `authMiddleware`.
 *
 * Placing this in a `.d.ts` file inside the `types/` directory ensures it is
 * picked up automatically by the TypeScript compiler without explicit imports.
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * The authenticated user context injected by `authMiddleware`.
       * Undefined on routes that do not use the middleware.
       */
      user?: AuthenticatedUser;
    }
  }
}

// This file must be a module (not a script) for declaration merging to work.
export {};
