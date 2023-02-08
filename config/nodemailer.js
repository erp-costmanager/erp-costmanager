const nodemailder = require('nodemailer')

const transporter = nodemailder.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_PASSWORD,
    },
})

module.exports = transporter