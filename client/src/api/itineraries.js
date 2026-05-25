import apiClient from "./axios.js";

const fetchItineraryHistory = async (limit = 12) => {
  const { data } = await apiClient.get("/itineraries", {
    params: { limit },
  });

  return data.data;
};

const fetchItineraryById = async (itineraryId) => {
  const { data } = await apiClient.get(`/itineraries/${itineraryId}`);

  return data.data.itinerary;
};

const generateItinerary = async (payload) => {
  const { data } = await apiClient.post("/itineraries/generate", payload);

  return data.data.itinerary;
};

const requestItineraryShare = async (itineraryId) => {
  const { data } = await apiClient.post(`/itineraries/${itineraryId}/share`);

  return data.data;
};

const fetchPublicItineraryByShareId = async (shareId) => {
  const { data } = await apiClient.get(`/itineraries/share/${shareId}`);

  return data.data.itinerary;
};

const downloadItineraryPdf = async (itineraryId) => {
  const response = await apiClient.get(`/itineraries/${itineraryId}/pdf`, { responseType: "blob" });

  return response.data;
};

const downloadPublicItineraryPdf = async (shareId) => {
  const response = await apiClient.get(`/itineraries/share/${shareId}/pdf`, { responseType: "blob" });

  return response.data;
};

export {
  downloadItineraryPdf,
  downloadPublicItineraryPdf,
  fetchItineraryById,
  fetchItineraryHistory,
  fetchPublicItineraryByShareId,
  generateItinerary,
  requestItineraryShare,
};