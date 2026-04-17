const generateRoomName = (appointmentId, doctorId, patientId) => {
  return `medigo-${appointmentId}-${doctorId}-${patientId}`;
};

export default generateRoomName;
