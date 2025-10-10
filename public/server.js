const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Chaves
const API_KEY = '5dkxbk7i1eyagmzxkydwr5uzj6w4inpgqhhc4d08ichuz6o8914hovr0x5jn';
const SECRET_KEY = 'ix6iv8ypxhcsm2g3zppce97w0j4m6jaxi4bg8wbgotdwnt0620jyb3thixwpdewohpo1qt3ng8nd317hmjtnrjcnwumeq66kilb56hpcrp13brg8ci32zq6r';

app.use(express.json());

// Endpoint para processar pagamento
app.post('/api/payment', async (req, res) => {
    const { amount, currency, context, callbackUrl, returnUrl, enviroment, method, customer_name, card, phone } = req.body;

    // Validação
    if (!amount || !currency || !context || !callbackUrl || !returnUrl || !enviroment || !method || !customer_name) {
        return res.status(400).json({ error: 'Dados incompletos.' });
    }

    let paymentData = {
        amount,
        currency,
        context,
        callbackUrl,
        returnUrl,
        enviroment,
        customer_name
    };

    try {
        if (method === 'card') {
            if (!card || !card.number || !card.expiry || !card.cvv) {
                return res.status(400).json({ error: 'Dados do cartão incompletos.' });
            }
            paymentData.card = {
                number: card.number,
                expiry: card.expiry,
                cvv: card.cvv
            };
        } else if (method === 'mpesa') {
            if (!phone) {
                return res.status(400).json({ error: 'Número de telefone M-Pesa inválido.' });
            }
            paymentData.phone_number = phone;
            paymentData.method = 'mpesa';
        } else {
            return res.status(400).json({ error: 'Método de pagamento inválido.' });
        }

        const response = await fetch('https://vendorapay.com/api/payment/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apiKey': API_KEY
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        
        if (response.ok) {
            res.json({ transaction_id: result.transaction_id || 'mock-transaction-id' });
        } else {
            res.status(response.status).json({ error: result.error || 'Erro na API de pagamento.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro de conexão com a API.' });
        console.error(error);
    }
});

// Endpoint para webhook
app.post('/webhook/payments', (req, res) => {
    const signature = req.headers['x-vendorapay-signature']; // Assumindo header de assinatura
    const payload = req.body;

    // Verificar assinatura
    const computedSignature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');

    if (signature === computedSignature) {
        console.log('Webhook recebido:', payload);
        if (payload.success && payload.status === 'completed') {
            console.log(`Pagamento confirmado: ${payload.method}, valor: ${payload.amount} ${payload.currency}`);
            // Aqui você pode atualizar um banco de dados, enviar e-mail, etc.
        }
        res.status(200).send('Webhook recebido com sucesso');
    } else {
        res.status(400).send('Assinatura inválida');
    }
});

// Servir o front-end
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
