const global = {
    state: {
        token: '',
        roomId: '',
        teacherId: '',
        role: '',
        socket: {}
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
        }
    }
}

export default global