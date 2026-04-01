const generateRoomName = (appointmentId, doctorId, patientId) => {
  return `medigo-${appointmentId}-${doctorId}-${patientId}`;
};

module.exports = generateRoomName;
