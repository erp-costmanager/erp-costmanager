module.exports = (hbs) => {
    hbs.registerHelper('isPending', (user) => user.status === 'Pending')
}