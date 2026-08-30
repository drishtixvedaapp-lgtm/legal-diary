import API from "./api";
const getToken = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

export const getCasesMissingPhone = async () => {
  const response = await API.get("/voice-phone/queue", getToken());
  return response.data;
};

export const attachPhoneToCase = async (caseId, phone) => {
  const response = await API.patch(`/voice-phone/${caseId}/attach-phone`, { phone }, getToken());
  return response.data;
};
