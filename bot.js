const { PrismaClient } = require('@prisma/client');
const TelegramBot = require('node-telegram-bot-api');
const token = '7143950256:AAGTZ5ef0f1JamcoielYlf1lLy_H9bcVT5E'; // Substitua pelo seu token

const prisma = new PrismaClient();
const bot = new TelegramBot(token, { polling: true });

// Função para verificar se está em horário comercial
function emHorarioComercial() {
    const agora = new Date();
    const horas = agora.getHours();
    return horas >= 9 && horas < 18;
}

// Objeto para rastrear usuários que estão aguardando fornecer email
const usuariosAguardandoEmail = {};

// Lidar com mensagens recebidas pelo bot
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const idTelegram = msg.from.id;
    const text = msg.text;

    if (usuariosAguardandoEmail[idTelegram]) {
        
        const email = text;
        delete usuariosAguardandoEmail[idTelegram];

        await prisma.user.upsert({
            where: {
                id_telegram: idTelegram.toString(),
            },
            update: {
                email: email,
            },
            create: {
                id_telegram: idTelegram.toString(),
                email: email,
            },
        });

 
        await bot.sendMessage(chatId, 'Seu email foi salvo com sucesso!');
    } else {
        if (emHorarioComercial()) {
            const link = 'https://uvv.br';
            await bot.sendMessage(chatId, `Aqui está o link: ${link}`);
        } else {
            await bot.sendMessage(chatId, 'Por favor, forneça seu email:');
            usuariosAguardandoEmail[idTelegram] = true;
        }
    }
});
