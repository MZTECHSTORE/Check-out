// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Para servir o HTML e assets

// Simulação de banco de dados
let users = {
  'user1': {
    saldoUSD: 0,
    historico: []
  }
};

// Vendorapay
const VENDORAPAY_API_URL = 'https://vendorapay.com/api';
const VENDORAPAY_API_KEY = '5dkxbk7i1eyagmzxkydwr5uzj6w4inpgqhhc4d08ichuz6o8914hovr0x5jn';

// --- Rotas ---

// Saldo do usuário
app.get('/api/saldo/:user', (req, res) => {
  const user = users[req.params.user];
  if(!user) return res.status(404).json({error:'Usuário não encontrado'});
  res.json({ saldoUSD: user.saldoUSD, historico: user.historico });
});

// Registrar ganho
app.post('/api/ganho', (req, res) => {
  const { user, valor, origem } = req.body;
  if(!users[user]) return res.status(404).json({error:'Usuário não encontrado'});
  users[user].saldoUSD += parseFloat(valor);
  users[user].historico.unshift(`${origem}: +$${parseFloat(valor).toFixed(2)}`);
  res.json({success:true});
});

// Criar pagamento Vendorapay
app.post('/api/vendorapay/create', async (req,res)=>{
  const { user, amount, currency } = req.body;
  if(!users[user]) return res.status(404).json({error:'Usuário não encontrado'});
  try{
    const response = await fetch(`${VENDORAPAY_API_URL}/create`,{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${VENDORAPAY_API_KEY}`
      },
      body: JSON.stringify({amount,currency})
    });
    const data = await response.json();
    res.json({success:true, paymentUrl:data.paymentUrl || 'https://vendorapay.com/mockpay'});
  }catch(err){ res.json({success:false,error:err.message,raw:err}); }
});

// Saque Vendorapay
app.post('/api/vendorapay/withdraw', async (req,res)=>{
  const { user, amount, currency } = req.body;
  if(!users[user]) return res.status(404).json({error:'Usuário não encontrado'});
  if(users[user].saldoUSD<amount) return res.json({success:false,error:'Saldo insuficiente'});
  users[user].saldoUSD -= parseFloat(amount);
  users[user].historico.unshift(`Saque: -$${parseFloat(amount).toFixed(2)}`);
  // Aqui você chamaria a API real da Vendorapay
  res.json({success:true});
});

// --- Start server ---
app.listen(PORT, ()=>{
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
