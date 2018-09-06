const graphql = require('graphql');
const axios = require('axios');

const {GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull} = graphql;

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                const url = `http://localhost:3000/companies/${parentValue.id}/users`;
                return axios.get(url)
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[CompanyType] error', error);
                    });
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        companyId: {
            type: CompanyType,
            resolve(parentValue, args) {
                const url = `http://localhost:3000/companies/${parentValue.companyId}`;

                return axios.get(url)
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[UserType] error', error);
                    });
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                const url = 'http://localhost:3000/users/';

                return axios.get(url + args.id)
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[RootQuery user] error', error);
                    });
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, args) {
                const url = 'http://localhost:3000/companies/';

                return axios.get(url + args.id)
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[RootQuery company] error', error);
                    });
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                age: {
                    type: new GraphQLNonNull(GraphQLInt)
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, {firstName, age, companyId}) {
                const url = 'http://localhost:3000/users';

                return axios.post(url, {
                    firstName,
                    age,
                    companyId
                })
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[mutation addUser] error', error);
                    });
            }
        },
        deleteUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
            },
            resolve(parentValue, { id }) {
                const url = `http://localhost:3000/users/${id}`;

                return axios.delete(url)
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[mutation deleteUser] error', error);
                    });
            }
        },
        editUser: {
            type: UserType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                firstName: {
                    type: GraphQLString
                },
                age: {
                    type: GraphQLInt
                },
                companyId: {
                    type: GraphQLString
                }
            },
            resolve(parentValue, { id, firstName, age, companyId }) {
                const url = `http://localhost:3000/users/${id}`;

                return axios.patch(url, {
                    firstName,
                    age,
                    companyId
                })
                    .then(response => response.data)
                    .catch(error => {
                        console.log('[mutation deleteUser] error', error);
                    });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
});