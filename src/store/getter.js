const getters = {
    token: state => state.global.token,
    roomId: state => state.global.roomId,
    teacherId: state => state.global.teacherId,
    role: state => state.global.role,
    socket: state => state.global.socket,
    setEntryLog: state => state.global.set_entry_log,
    setEagleLog: state => state.global.set_eagle_log,
}

export default getters