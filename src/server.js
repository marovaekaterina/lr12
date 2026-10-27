const express = require('express');
const app = express();
const auth = require('./routes/auth.routes');
app.use(express.json());
app.use("/auth", auth);

app.get("/", (req, res) => {
  res.json({ message: "Домашняя страница. Бэк работает" });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});