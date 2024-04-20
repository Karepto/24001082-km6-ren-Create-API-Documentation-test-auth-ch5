const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    index : async (req, res, next) => {
        try {
            const transactions = await prisma.transaction.findMany();
            if (!transactions) {
              return res.status(404).json({ error: 'Transaction dont have data yet' });
            }
            res.status(200).json({
                status: true,
                message: 'OK',
                data: transactions
            })
        }
        catch (err) {
            next(err);
        }
    },

    show : async (req, res, next) => {
        try {
            const transactionId = parseInt(req.params.transactionId);
            const transaction = await prisma.transaction.findUnique({
              where: { id: transactionId },
              include: {
                sourceAccount: true,
                destinationAccount: true
              }
            });
        
            if (!transaction) {
              return res.status(404).json({ error: 'Transaction not found' });
            }
        
            const sender = await prisma.user.findUnique({
              where: { id: transaction.sourceAccount.userId }
            });
        
            const recipient = await prisma.user.findUnique({
              where: { id: transaction.destinationAccount.userId }
            });
        
            res.status(200).json({
                status: true,
                message: 'OK',
                data: {
                    id: transaction.id,
                    amount: transaction.amount,
                    sender: sender.name,
                    recipient: recipient.name
                }
            })
        }
        catch (err) {
            next(err);
        }
    },

    store : async (req, res, next) => {
        try {
            const { sourceAccountId, destinationAccountId, amount } = req.body;
        
            const sourceAccount = await prisma.bankAccount.findUnique({
              where: { id: sourceAccountId }
            });
            const destinationAccount = await prisma.bankAccount.findUnique({
              where: { id: destinationAccountId }
            });
        
            if (!sourceAccount || !destinationAccount) {
              return res.status(404).json({ error: 'Source or destination account not found' });
            }
        
            // Memastikan bahwa sumber atau akun yang akan mengirim memiliki saldo yang cukup
            if (sourceAccount.balance < amount) {
              return res.status(400).json({ error: 'Insufficient balance' });
            }
        
            await prisma.transaction.create({
              data: {
                amount,
                sourceAccount: { connect: { id: sourceAccountId } },
                destinationAccount: { connect: { id: destinationAccountId } }
              }
            });
        
            // Mengubah balance saat transaksi selesai dilakukan
            await prisma.bankAccount.update({
              where: { id: sourceAccountId },
              data: { balance: { decrement: amount } }
            });
        
            await prisma.bankAccount.update({
              where: { id: destinationAccountId },
              data: { balance: { increment: amount } }
            });
        
            res.json({ message: 'Transaction successful' });
    }
    catch (err) {
        next(err);
    }
        
}  
}