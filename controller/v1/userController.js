const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const prisma = new PrismaClient();

module.exports = {
    index : async (req, res, next) => {
        try {
            let {search} = req.query;
            const users = await prisma.user.findMany( { where: { name: { contains: search } } } );
            if (!users) {
              return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({
                status: true,
                message: 'OK',
                data: users
            })
        }
        catch (err) {
            next(err);
        }
    },

    show : async (req, res, next) => {
        try {
            const id = parseInt(req.params.id);
            const user = await prisma.user.findUnique({
              where: { id: id },
              include: { profile: true }
            });
            if (!user) {
              return res.status(404).json({ error: 'User not found' });
            }
            res.status(200).json({
                status: true,
                message: 'OK',
                data: user
            })
        }
        catch (err) {
            next(err);
        }
    },

    store: async (req, res, next) => {
        try {
            const { name, email, password, profileData } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'name, email, and password are required',
                    data: null
                });
            }

            let exist = await prisma.user.findFirst({
                where: {
                    email
                }
            })
            if (exist) {
                return res.status(400).json({
                    status: false,
                    message: 'email already exist',
                    data: null
                });
            }

            let encryptPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password : encryptPassword,
                    profile: {
                        create: profileData
                    }
                },
                include: {
                    profile: true
                }
            });
            delete user.password;
            res.status(201).json({
                status: true,
                message: 'user created',
                data: user
            });
        } catch (err) {
            next(err); // Meneruskan kesalahan ke middleware error handling
        }
    },

    login : async (req, res, next) => {
        try {
            let {email, password} = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    status: false,
                    message: 'email and password are required',
                    data: null
                });
            }

            let user = await prisma.user.findFirst({
                where: {
                    email
                }
            })

            if (!user) {
                return res.status(400).json({
                    status: false,
                    message: 'email or password are wrong',
                    data: null
                })
            }

            let checkPassword = await bcrypt.compare(password, user.password);
            console.log(checkPassword)
            if (!checkPassword) {
                return res.status(400).json({
                    status: false,
                    message: 'email or password are wrong',
                    data: null
                })
            }

            delete user.password
            let token = jwt.sign({user}, JWT_SECRET);

            res.status(200).json({
                status: true,
                message: 'User logged in successfully',
                data: {...user, token}
            })

            
        } catch (error) {
            next(error);
        }
    },

    checkauth : async (req, res, next) => {
        try {
            res.status(200).json({
                status: true,
                message: 'This User is already authorized',
                data: req.user
            })
        } catch (error) {
            next(error);
        }
    }
    
}    