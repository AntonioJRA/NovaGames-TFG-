/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#111827",   // Azul negro muy oscuro (encabezado, fondo base)
        secondary: "#1E293B", // Gris-azul profundo (paneles, secciones)
        background: "#0A0E1A", // Casi negro con un matiz azul
        surface: "#1f2937",   // Gris oscuro suave (tarjetas, contenedores)
        text: "#CBD5E1",      // Gris claro-azulado (texto general)
        accent: "#4a5b7e",    // Azul algo más vivo pero no chillón (botones, enlaces)
      },
    },
  },
  plugins: [],
};
