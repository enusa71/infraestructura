import { auth } from "./auth";

export default auth((req) => {
  // auth() middleware maneja la redirección a /login automáticamente
  // si no hay sesión válida
  return undefined;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon-192x192.png).*))",
  ],
};
