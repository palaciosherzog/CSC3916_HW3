let envPath = __dirname + "/../.env"
require('dotenv').config({ path: envPath });
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../Users');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'test',
    username: 'email@email.com',
    password: '123@abc'
}

describe('Register, Login and Call Test Collection with Basic Auth and JWT Auth', () => {
    // after this test suite, delete the new user we had created
    after((done) => {
        User.deleteOne({ name: 'test' }, function (err, user) {
            if (err) throw err;
        });
        done();
    })

    // test the sign up functionality and sign in functionality
    describe('/signup', () => {
        it('it should sign up and sign in and get a token', (done) => {
            chai.request(server)
                .post('/signup')
                .send(login_details)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.success.should.be.eql(true);
                    //follow-up to get the JWT token from signing in 
                    chai.request(server)
                        .post('/signin')
                        .send(login_details)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('token');
                            let token = res.body.token;
                            console.log(token);
                            done();
                        })
                })
        })
    });

});
