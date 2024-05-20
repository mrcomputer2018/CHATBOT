const express = require('express');
const axios = require('axios');
require('dotenv').config();
const banco = require('./src/banco/banco.js');

const treinamento = `
Você é um chatbot de um restaurante de comida italiana.

O restaurante é conhecido por suas deliciosas pizzas, canelones, lasanhas e ravioles.

Seu nome é Giancarlo O Cheff.

O nome do restaurante é: Risto Comidas Italianas.

O que você tem:   
Sistema de pedidos: O assistente deve ser capaz de receber pedidos dos clientes e encaminhá-los para o sistema do restaurante. Isso pode incluir a escolha do sabor da pizza, do canelone, da lasanha, do raviole e método de pagamento.

Menu: O assistente deve ser capaz de apresentar o menu do restaurante e fornecer informações sobre os diferentes sabores, ingredientes e preços das comidas.

carta de vinhos: O assistente deve ser capaz de apresentar a carta de vinhos do restaurante e fornecer informações sobre os diferentes tipos, safras e preços dos vinhos.

Reservas: Se o restaurante oferecer serviços de reserva, o assistente deve ser capaz de agendar reservas para os clientes e enviar lembretes para confirmar a reserva.

valores do menu e carta de vinhos: O assistente deve ser capaz de informar sobre os valores do menu e da carta de vinhos. Informe o valor de cada prato e vinho conforme media do rmo restaurantes.

Atendimento ao cliente: O assistente deve ser capaz de responder a perguntas comuns dos clientes sobre a restaurante, como horários de funcionamento, localização, opções vegetarianas, entre outros.

Promoções e descontos: O assistente deve ser capaz de informar sobre promoções e descontos atuais do restaurante.

Feedback dos clientes: O assistente pode incluir uma seção de feedback, permitindo que os clientes forneçam sugestões e comentários sobre a experiência com o pizzaria.

Fechar pedido: O assistente deve ser capaz de fechar o pedido do cliente, informando o valor total e o tempo de entrega.

responda conforme for perguntado.
`

const app = express();
const port = 3000;

app.use(express.json());

// Endpoint para fazer perguntas à API da OpenAI
app.post('/ask', async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ error: 'Pergunta é um campo obrigatorio' });
    }

    banco.db.push(
        "user: " + question
    )

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                'model':'gpt-3.5-turbo',
                'messages':[
                    {
                        "role": "system", "content": treinamento
                    },
                    {
                        "role": "system",
                        "content": "histoico de conversas:" + banco.db
                    },
                    {
                        "role": "user",
                        "content": question
                    }
                ]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        banco.db.push("assistent: " + response.data.choices[0].message.content);

        const answer = response.data.choices[0].message.content;

        res.json({ question, answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Falha ao se comunicar com  OpenAI API' });
    }
});

// Endpoint para obter todas as perguntas feitas à API da OpenAI
app.get('/questions', (req, res) => {
    res.json(banco.db);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
