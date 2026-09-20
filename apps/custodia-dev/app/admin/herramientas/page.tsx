'use client';

import { useState, useEffect } from 'react';
import { crearHerramienta, actualizarHerramienta, eliminarHerramienta, listarHerramientas } from './actions';

interface Herramienta {
  id: string;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
}

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarHerramientas();
  }, []);

  const cargarHerramientas = async () => {
    const result = await listarHerramientas();
    if (result.success) {
      setHerramientas(result.herramientas);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    try {
      let result;
      if (editingId) {
        result = await actualizarHerramienta(editingId, nombre, descripcion);
        setEditingId(null);
      } else {
        result = await crearHerramienta(nombre, descripcion);
      }

      if (result?.success) {
        setNombre('');
        setDescripcion('');
        await cargarHerramientas();
      } else {
        alert('Error: ' + (result?.error || 'No se pudo guardar'));
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Eliminar herramienta?')) {
      await eliminarHerramienta(id);
      cargarHerramientas();
    }
  };

  const handleEditar = (h: Herramienta) => {
    setEditingId(h.id);
    setNombre(h.nombre);
    setDescripcion(h.descripcion || '');
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Catálogo de Herramientas</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-8">
          <input
            type="text"
            placeholder="Nombre herramienta"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black"
            required
          />
          <textarea
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border rounded mb-4 text-black"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Actualizar' : 'Agregar'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setNombre('');
                setDescripcion('');
              }}
              className="w-full mt-2 bg-gray-400 text-white p-2 rounded"
            >
              Cancelar
            </button>
          )}
        </form>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Descripción</th>
                <th className="text-center p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {herramientas.map((h) => (
                <tr key={h.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{h.nombre}</td>
                  <td className="p-4 text-gray-600">{h.descripcion || '-'}</td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => handleEditar(h)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleEliminar(h.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
