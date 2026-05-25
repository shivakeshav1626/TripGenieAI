import apiClient from "./axios.js";

const fetchUploadHistory = async () => {
  const { data } = await apiClient.get("/uploads");
  return data.data.uploads;
};

const fetchUploadById = async (uploadId) => {
  const { data } = await apiClient.get(`/uploads/${uploadId}`);
  return data.data.upload;
};

const uploadTravelDocuments = async (formData, onUploadProgress) => {
  // Do NOT set the Content-Type header manually here — leave it to the browser
  // so the correct multipart boundary is attached. We pass onUploadProgress
  // to show upload progress in the UI.
  const { data } = await apiClient.post("/uploads", formData, {
    onUploadProgress,
  });

  return data.data.uploads;
};

export { fetchUploadById, fetchUploadHistory, uploadTravelDocuments };
