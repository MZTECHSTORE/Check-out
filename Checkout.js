  <!-- SDK placeholder do Vendorapay: substitua pela URL real do SDK -->
  <script src="https://cdn.vendorapay.com/sdk.js"></script>
  <!-- PayPal SDK (mantido) -->
  <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&components=buttons&intent=capture&currency=MZN"></script>

  <style>
    /* estilos mínimos para os hosted fields */
    .vf-field {
      height:44px;
      border:1px solid #e5e7eb;
      border-radius:6px;
      padding:8px;
      background: #fff;
    }
    .vf-label { font-size:0.9rem; margin-bottom:6px; color:#374151; }
  </style>
</head>
<body class="bg-mzgray text-gray-800 font-sans">
  <div class="max-w-3xl mx-auto p-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Finalizar compra — MZ TECH STORE</h1>
      <p class="text-sm text-gray-600">Produto: <strong>Produto Personalizado</strong> — Preço: <span id="product-price">400 MZN</span></p>
    </header>

    <!-- Hosted Fields (Vendorapay) -->
    <section class="bg-white p-6 rounded-lg shadow mb-6">
      <h2 class="font-semibold mb-3">Pagar com Cartão — (Vendorapay seguro)</h2>
      <p class="text-sm text-gray-600 mb-4">
        Os dados do cartão são inseridos diretamente nos Hosted Fields do Vendorapay. <strong>Nenhum dado de cartão passa por este servidor.</strong>
      </p>

      <!-- wrapper do hosted fields: SDK cria iframes dentro dessas divs -->
      <form id="hosted-card-form" class="space-y-3">
        <div>
          <label class="vf-label">Nome no cartão</label>
          <input id="cardholder-name" name="cardholderName" required class="w-full border rounded p-2" placeholder="Nome como no cartão" />
        </div>

        <div>
          <label class="vf-label">Número do cartão</label>
          <div id="vf-number" class="vf-field"></div>
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="vf-label">MM/AA</label>
            <div id="vf-expiry" class="vf-field"></div>
          </div>
          <div class="w-28">
            <label class="vf-label">CVV</label>
            <div id="vf-cvv" class="vf-field"></div>
          </div>
        </div>

        <button id="vendorapay-pay-btn" type="submit" class="bg-mzblue text-white px-4 py-2 rounded">Pagar com Cartão (Seguro)</button>
      </form>

      <p id="hosted-result" class="mt-3 text-sm"></p>
      <p class="mt-2 text-xs text-gray-500">Servidor receberá apenas um token (paymentMethodToken). Não guarde CVV ou número de cartão.</p>
    </section>

    <!-- PayPal button -->
    <section class="bg-white p-6 rounded-lg shadow mb-6">
      <h2 class="font-semibold mb-3">Pagar com PayPal</h2>
      <div id="paypal-button-container"></div>
    </section>

    <!-- Outros métodos (M-Pesa / Vendorapay Mobile) mantidos -->
    <section class="bg-white p-6 rounded-lg shadow mb-6">
      <h2 class="font-semibold mb-3">Pagar com M-Pesa (STK Push)</h2>
      <label class="block text-sm mb-2">Número M-Pesa</label>
      <div class="flex gap-3">
        <input id="mpesa-phone" class="flex-1 border rounded p-2" placeholder="Ex: 25884xxxxxxx" />
        <button id="mpesa-btn" class="bg-mzgreen text-white px-4 py-2 rounded">Pagar com M-Pesa</button>
      </div>
      <p id="mpesa-status" class="mt-2 text-sm"></p>
    </section>

    <footer class="text-xs text-gray-500 mt-6">
      Nota: Substitua todas as chaves/URLs de exemplo pelas suas credenciais do Vendorapay e configure endpoints de servidor para trocar o token por uma cobrança no lado do servidor.
    </footer>
  </div>

  <script>
    const PRICE = 400;
    const hostedResult = document.getElementById('hosted-result');

    /**************************************************************************
     * Inicialização do Vendorapay (EXEMPLO)
     * Substitua CLIENT_KEY e nomes de funções pelo que a doc oficial indicar.
     **************************************************************************/
    (function initVendorapay(){
      if(!window.Vendorapay) {
        hostedResult.textContent = 
        return;
      }

      // Inicializa o SDK com sua chave pública
/* -----------------------------
   Vendorapay integration
----------------------------- */
const VENDORAPAY_API_URL = 'https://vendorapay.com/api';
const VENDORAPAY_API_KEY = '5dkxbk7i1eyagmzxkydwr5uzj6w4inpgqhhc4d08ichuz6o8914hovr0x5jn';
const VENDORAPAY_WEBHOOK_KEY = 'ix6iv8ypxhcsm2g3zppce97w0j4m6jaxi4bg8wbgotdwnt0620jyb3thixwpdewohpo1qt3ng8nd317hmjtnrjcnwumeq66kilb56hpcrp13brg8ci32zq6r';

app.post('/api/vendorapay/pay', async (req, res) => {
  try {
    const { phone, amount } = req.body;
    if (!phone) return res.status(400).json({ error: 'Telefone é obrigatório' });

    const payload = {
      apiKey: VENDORAPAY_API_KEY,
      msisdn: phone,
      amount: amount || 400,
      reference: `MZTECH-${Date.now()}`,
      callbackUrl: `${req.protocol}://${req.get('host')}/api/vendorapay/webhook`
    };

    const response = await axios.post(`${VENDORAPAY_API_URL}/pay`, payload, { headers: { 'Content-Type': 'application/json' } });
    res.json({ success: true, data: response.data, message: 'Pagamento enviado para Vendorapay' });
  } catch (err) {
    console.error('Vendorapay payment error', err.response ? err.response.data : err.message);
    res.status(500).json({ error: 'Erro ao iniciar Vendorapay', details: err.response ? err.response.data : err.message });
  }
});

// Webhook endpoint
app.post('/api/vendorapay/webhook', (req, res) => {
  const signature = req.headers['x-vendorapay-signature'];
  if (signature !== VENDORAPAY_WEBHOOK_KEY) {
    console.warn('Webhook Vendorapay inválido:', signature);
    return res.status(403).send('Forbidden');
  }

  console.log('Webhook Vendorapay recebido:', req.body);
  // Aqui você deve atualizar status do pedido no seu banco de dados
  res.status(200).send('OK');
});

    /***********************
     * PayPal Buttons
     ***********************/
    paypal.Buttons({
      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{ amount: { value: PRICE.toString() } }]
        });
      },
      onApprove: function(data, actions) {
        return actions.order.capture().then(details => alert('Pagamento PayPal concluído. Obrigado!'));
      }
    }).render('#paypal-button-container');

    /***********************
     * M-Pesa (simulado)
     ***********************/
    document.getElementById('mpesa-btn').addEventListener('click', async () => {
      const phone = document.getElementById('mpesa-phone').value.trim();
      if(!phone) return alert('Insira um número M-Pesa.');
      document.getElementById('mpesa-status').textContent = 'Iniciando pedido...';
      const res = await fetch('/api/mpesa/stkpush', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({ phone, amount: PRICE })
      });
      const j = await res.json();
      document.getElementById('mpesa-status').textContent = j.message || JSON.stringify(j);
    });
  </script>
</body>
</html>
