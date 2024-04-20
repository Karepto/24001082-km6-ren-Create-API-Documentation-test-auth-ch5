const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    index : async (req, res, next) => {
        try {
            const account = await prisma.bankAccount.findMany();
            if (!account) {
              return res.status(404).json({ error: 'bank account dont have data yet' });
            }
            res.status(200).json({
                status: true,
                message: 'OK',
                data: account
            })
        }
        catch (err) {
            next(err);
        }
    },

    show : async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const account = await prisma.bankAccount.findUnique({
              where: { id: id }
            });
            if (!account) {
              return res.status(404).json({ error: 'bank account not found' });
            }
            res.status(200).json({
                status: true,
                message: 'OK',
                data: account
            })
        }
        catch (err) {
            next(err);
        }
    },

    store : async (req, res, next) => {
        try {
            const { userId, bankName, bankAccountNumber, balance } = req.body;
            const account = await prisma.bankAccount.create({
              data: {
                user: { connect: { id: userId } },
                bankName,
                bankAccountNumber,
                balance
              }
            });
            res.status(201).json({
                status: true,
                message: 'OK',
                data: account
            });
        }
        catch (err) {
            next(err);
        }
}
};