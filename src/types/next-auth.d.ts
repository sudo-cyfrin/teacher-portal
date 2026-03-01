import 'next-auth';

declare module 'next-auth' {
  interface User {
    department?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      department: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    department?: string;
  }
}
