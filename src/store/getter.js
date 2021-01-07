const getters = {
    token: state => state.global.token,
    roomId: state => state.global.roomId,
    teacherId: state => state.global.teacherId,
    role: state => state.global.role
}

export default getters