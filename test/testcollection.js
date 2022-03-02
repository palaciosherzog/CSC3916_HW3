let envPath = __dirname + '/../.env';
require('dotenv').config({ path: envPath });
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../Users');
let Movie = require('../Movies');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'test',
    username: 'email@email.com',
    password: '123@abc'
};

// random movie off of IMDB cause I don't watch movies
let movie_details = {
    title: 'The Batman',
    yearReleased: 2022,
    genre: 'Action',
    actors: [
        {
            actorName: 'Zoe Kravitz',
            characterName: 'Catwoman'
        },
        {
            actorName: 'Robert Pattinson',
            characterName: 'Batman'
        }, 
        {
            actorName: 'Paul Dano',
            characterName: 'The Riddler'
        }
    ]
};

/*describe('Register and Login Test', () => {
    beforeEach((done) => {
        // delete the test user if it exists so that we don't have issues
        User.deleteOne({ name: 'test' }, function (err, user) {
            if (err) throw err;
        });
        done();
    });

    // after this test suite, delete the new user we had created
    after((done) => {
        User.deleteOne({ name: 'test' }, function (err, user) {
            if (err) throw err;
        });
        Movie.deleteMany({ title: 'The Batman' }, function (err, movies) {
            if (err) throw err;
            console.log("Deleted", movies);
        });
        done();
    });

    // test the sign up functionality and sign in functionality
    describe('/signup', () => {
        it('it should sign up and sign in and get a token', (done) => {
            chai.request(server)
                .post('/signup')
                .send(login_details)
                .end((err, res) => {
                    console.log(res.body);
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
                        });
                });
        });
    });
});*/

describe('Movies tests', () => {
    let token='';
    // before this test suite, sign up and sign in 
    before((done) => {
        var user = new User();
        user.name = login_details.name;
        user.username = login_details.username;
        user.password = login_details.password;
        user.save();
        chai.request(server)
            .post('/signin')
            .send(login_details)
            .end((err, res) => {
                token = res.body.token;
                done();
            });
    });

    describe('/movies POST', () => {
        it('it should add the valid movie', (done) => {
            chai.request(server)
                .post('/movies')
                .set('Authorization', token)
                .send(movie_details)
                .end((err, res) => {
                    console.log(
                        'Tried adding movie. Got:',
                        JSON.stringify(res.body)
                    );
                    res.should.have.status(200);
                    done();
                });
        });
        it('it should return an error for a movie without ', (done) => {
            let movie_copy = JSON.parse(JSON.stringify(movie_details));
            movie_copy['genre'] = 'act';
            chai.request(server)
                .post('/movies')
                .set('Authorization', token)
                .send(movie_copy)
                .end((err, res) => {
                    console.log(
                        'Tried adding movie. Got:',
                        JSON.stringify(res.body)
                    );
                    res.should.have.status(400);
                    done();
                });
        });
        it('it should return an error for a movie without ', (done) => {
            let movie_copy = JSON.parse(JSON.stringify(movie_details));
            delete movie_copy.actors;
            chai.request(server)
                .post('/movies')
                .set('Authorization', token)
                .send(movie_copy)
                .end((err, res) => {
                    console.log(
                        'Tried adding movie. Got:',
                        JSON.stringify(res.body)
                    );
                    res.should.have.status(400);
                    done();
                });
        });
        it('it should return an error for a movie without ', (done) => {
            let movie_copy = JSON.parse(JSON.stringify(movie_details));
            delete movie_copy.actors[0].characterName;
            chai.request(server)
                .post('/movies')
                .set('Authorization', token)
                .send(movie_copy)
                .end((err, res) => {
                    console.log(
                        'Tried adding movie. Got:',
                        JSON.stringify(res.body)
                    );
                    res.should.have.status(400);
                    done();
                });
        });
        it('it should return an error for an invalid method', (done) => {
            chai.request(server)
                .put('/movies')
                .set('Authorization', token)
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
    });
});