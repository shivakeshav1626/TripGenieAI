import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { loginUser, registerUser, sanitizeUser } from "../services/authService.js";

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const result = await registerUser({ name, email, password });

  res.status(201).json(
    new ApiResponse(201, result, "User registered successfully")
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser({ email, password });

  res.status(200).json(new ApiResponse(200, result, "Login successful"));
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { user: sanitizeUser(req.user) }, "Current user")
  );
});

export { login, me, register };
