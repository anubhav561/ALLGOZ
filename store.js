// In-memory data store
const store = {
    users: new Map(),
    sessions: new Map(),
    transactions: new Map()
};

module.exports = store; 