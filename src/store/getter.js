const getters = {
    token: state => state.global.token,
    roomId: state => state.global.roomId,
    teacherId: state => state.global.teacherId,
    role: state => state.global.role,
    socket: state => state.global.socket
}

export default getters