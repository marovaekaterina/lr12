const express = require('express');
const path = require('path');
const auth = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('views', path.join(__dirname, '../view'));
app.set('view engine', 'ejs');

app.use("/auth", auth);

app.get("/", (req, res) => {
  res.redirect("/auth/signin");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});