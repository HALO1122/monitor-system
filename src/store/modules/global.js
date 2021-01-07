const global = {
    state: {
        token: '',
        roomId: '',
        teacherId: '',
        role: ''
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
        }
    }
}

export default global