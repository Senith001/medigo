const generateJitsiMeetingLink = (roomName) => {
  const baseUrl = process.env.JITSI_BASE_URL || "https://meet.jit.si";
  return `${baseUrl}/${roomName}`;
};

module.exports = {
  generateJitsiMeetingLink,
};
