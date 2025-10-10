const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Chaves
const API_KEY = '5dkxbk7i1eyagmzxkydwr5uzj6w4inpgqhhc4d08ichuz6o8914hovr0x5jn';
const WEBHOOK_SECRET = 'ix6iv8ypxhcsm2g3zppce97w0j4m6jaxi4bg8wbgotdwnt0620jyb3thixwpdewohpo1qt3ng8nd317hmjtnrjcnwumeq66kilb56hpcrp13brg8ci32zq6r';

app.use(express.json());

// Endpoint para processar pagamento
app.post('/api/payment', async (req, res) => {
    const { amount, currency, name, description, method, card, phone } = req.body;

    if (!amount || !currency || !name || !method) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }

    let apiUrl = 'https://api.vendorapay.com/payments'; // Endpoint base do VendoraPay
    let paymentData = {
        amount,
        currency,
        customer_name: name,
        description
    };

    try {
        if (method === 'card') {
            if (!card || !card.number || !card.expiry || !card.cvv) {
                return res.status(400).json({ error: 'Dados do cartão incompletos.' });
            }
            apiUrl += '/card'; // Assumindo sub-endpoint para cartões
            paymentData.card_number = card.number;
            paymentData.card_expiry = card.expiry;
            paymentData.card_cvv = card.cvv;
        } else if (method === 'mpesa') {
            if (!phone) {
                return res.status(400).json({ error: 'Número de telefone M-Pesa inválido.' });
            }
            apiUrl += '/mpesa'; // Assumindo sub-endpoint para M-Pesa
            paymentData.phone_number = phone;
            // Aqui, a API do VendoraPay enviaria o prompt para o celular
        } else {
            return res.status(400).json({ error: 'Método de pagamento inválido.' });
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        
        if (response.ok) {
            res.json({ transactionId: result.transaction_id || 'mock-transaction-id' });
        } else {
            res.status(response.status).json({ error: result.error || 'Erro na API de pagamento.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro de conexão com a API.' });
    }
});

// Endpoint para webhook (inalterado, mas processa eventos de M-Pesa também)
app.post('/webhook/payments', (req, res) => {
    const signature = req.headers['x-vendorapay-signature'];
    const payload = req.body;

    const computedSignature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    if (signature === computedSignature) {
        console.log('Webhook recebido (M-Pesa ou Cartão):', payload);
        // Exemplo: if (payload.method === 'mpesa' && payload.status === 'completed') { processarEntrega(); }
        res.status(200).send('Webhook recebido com sucesso');
    } else {
        res.status(400).send('Assinatura inválida');
    }
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
