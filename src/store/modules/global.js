const global = {
    state: {
        token: '',
        roomId: '',
        teacherId: '',
        role: '',
        socket: {},
        set_entry_log: [],
        set_eagle_log: []
    },
    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token;
        },
        ROOM_ID: (state, roomId)=> {
            state.roomId = roomId;
        },
        TEACHER_ID: (state, teacherId)=> {
            state.teacherId = teacherId;
        },
        SAVE_ROLE: (state, role)=> {
            state.role = role;
        },
        SET_SOCKET: (state, socket)=> {
            state.socket = socket;
        },
        SET_ENTRY_LOG: (state, set_entry_log)=> {
            state.set_entry_log = set_entry_log;
        },
        SET_EAGLE_LOG: (state, set_eagle_log)=> {
            state.set_eagle_log = set_eagle_log;
        }
    },
    actions: {
        token ({ commit }, token) {
            commit('SET_TOKEN', token)
        },
        roomId({ commit }, roomId) {
            commit('ROOM_ID', roomId)
        },
        teacherId({ commit }, teacherId) {
            commit('TEACHER_ID', teacherId)
        },
        role({ commit }, role) {
            commit('SAVE_ROLE', role)
        },
        socket({ commit }, socket) {
            commit('SET_SOCKET', socket)
        },
        setEntryLog({ commit }, set_entry_log) {
            commit('SET_ENTRY_LOG', set_entry_log)
        },
        setEagleLog({ commit }, set_eagle_log) {
            commit('SET_EAGLE_LOG', set_eagle_log)
        }
    }
}

export default global