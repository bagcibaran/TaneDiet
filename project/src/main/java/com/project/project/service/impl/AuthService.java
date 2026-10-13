package com.project.project.service.impl;

import com.project.project.dto.LoginRequest;
import com.project.project.dto.LoginResponse;
import com.project.project.dto.UserCreateRequest;
import com.project.project.dto.UserResponse;
import com.project.project.entity.User;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.UserRepository;
import com.project.project.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserService userService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    public UserResponse register(UserCreateRequest request) {
        return userService.createUser(request);
    }

    public LoginResponse login(LoginRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isEmpty()) {
            throw new UserNotFoundException("Email veya şifre hatalı");
        }

        User user = existingUser.get();

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!passwordMatches) {
            throw new UserNotFoundException("Email veya şifre hatalı");
        }

        String token = jwtService.generateToken(user);
        return new LoginResponse(token, "Giriş Başarılı", user.getRole());
    }
}