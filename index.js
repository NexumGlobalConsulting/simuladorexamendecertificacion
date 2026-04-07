app.use(cors());
app.use(express.json());

// 🔥 RUTA ABSOLUTA REAL
const rootPath = path.resolve(__dirname, "..");

// 🔥 FORZAR ENTREGA DE HTML
app.get("/index.html", (req, res) => {
  res.sendFile(path.join(rootPath, "index.html"));
});

// 🔥 OPCIONAL: redirigir raíz al HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(rootPath, "index.html"));
});

// servidor
app.listen(3000, "0.0.0.0", () => {
  console.log("🔥 Servidor corriendo en puerto 3000");
});