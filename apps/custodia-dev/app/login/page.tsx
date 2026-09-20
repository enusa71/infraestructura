'use client';

import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();

  const handleLogin = () => {
    startTransition(async () => {
      await signIn("keycloak", { redirectTo: "/" });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Custodia</h1>
          <p className="text-gray-600">Control de Herramientas</p>
          <p className="text-sm text-gray-500 mt-1">Zona Franca Barranquilla</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isPending}
            className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {isPending ? "Conectando..." : "Iniciar sesión con Keycloak"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600">
            Para acceder, necesitas una cuenta en el Keycloak corporativo.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Sistema de Custodia de Herramientas
            <br />
            Zona Franca de Barranquilla
          </p>
        </div>
      </div>
    </div>
  );
}
