const crm = require('./customer');

test("it has a validateEmail function that works", ()=>{
    expect(crm.validateEmail('me@example.com')).toBe(true)
});
