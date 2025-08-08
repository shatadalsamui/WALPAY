import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Extends the built-in session.user type to include our custom fields.
   */
  interface User {
    id: string;
    number?: string | null;
  }

  interface Session {
    user: User;
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT type to include our custom fields.
   */
  interface JWT {
    id: string;
    number?: string | null;
  }
}
