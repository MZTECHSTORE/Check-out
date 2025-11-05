// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulação de usuários e saldos
let users = {
  'user1': { saldoUSD: 10.0, historico: [] }
};

// Obter saldo do usuário
app.get('/api/saldo/:user', (req, res) => {
  const user = req.params.user;
  if (!users[user]) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json({ saldoUSD: users[user].saldoUSD, historico: users[user].historico });
});

// Registrar ganho de mini-game
app.post('/api/ganho', (req, res) => {
  const { user, valor, origem } = req.body;
  if (!user || !valor || !origem) return res.status(400).json({ error: 'Parâmetros inválidos' });
  
  if (!users[user]) users[user] = { saldoUSD: 0, historico: [] };
  
  users[user].saldoUSD += valor;
  users[user].historico.unshift(`${origem}: +$${valor.toFixed(2)} USD`);
  
  res.json({ success: true, saldoAtual: users[user].saldoUSD });
});

// Processar saque
app.post('/api/sacar', (req, res) => {
  const { user, valor, metodo } = req.body;
  if (!user || !valor || !metodo) return res.status(400).json({ error: 'Parâmetros inválidos' });
  if (!users[user] || users[user].saldoUSD < valor) return res.status(400).json({ error: 'Saldo insuficiente' });

  users[user].saldoUSD -= valor;
  users[user].historico.unshift(`Saque: -$${valor.toFixed(2)} USD via ${metodo}`);

  // Simulação de chamada real à API PayPal / Vendorapay
  // Aqui você integraria usando a API Key fornecida

  res.json({
    success: true,
    saldoAtual: users[user].saldoUSD,
    message: `Saque de $${valor.toFixed(2)} via ${metodo} realizado com sucesso!`
  });
});

// Registrar ganho contínuo (Time To Earn)
app.post('/api/time-to-earn', (req, res) => {
  const { user, valor } = req.body;
  if (!user || !valor) return res.status(400).json({ error: 'Parâmetros inválidos' });
  if (!users[user]) users[user] = { saldoUSD: 0, historico: [] };

  users[user].saldoUSD += valor;
  users[user].historico.unshift(`Time To Earn: +$${valor.toFixed(2)} USD`);
  
  res.json({ success: true, saldoAtual: users[user].saldoUSD });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
