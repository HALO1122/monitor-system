const global = {
    state: {
        token: '',
        roomId: '',
        teacherId: ''
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
        }

    }
}

export default global