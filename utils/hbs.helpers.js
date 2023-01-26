module.exports = (hbs) => {
    hbs.registerHelper('isPending', (user) => user.status === 'Pending')
    hbs.registerHelper('isEmployee', (user) => user.role === 'Employee')
    hbs.registerHelper('isManager', (user) => user.role === 'Manager')
    hbs.registerHelper('isAdmin', (user) => user.role === 'Admin')
}