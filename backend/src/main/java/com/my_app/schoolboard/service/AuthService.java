package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.AuthResponse;
import com.my_app.schoolboard.dto.LoginRequest;
import com.my_app.schoolboard.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
