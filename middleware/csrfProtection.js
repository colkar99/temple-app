const csrf = require('csurf');

const csrfProtection = csrf();


exports.csrfProtection = csrfProtection;