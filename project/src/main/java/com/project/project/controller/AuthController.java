package com.project.project.controller;

import com.project.project.dto.LoginRequest;
import com.project.project.dto.LoginResponse;
import com.project.project.dto.InviteLookupResponse;
import com.project.project.dto.RegisterRequest;
import com.project.project.dto.UserResponse;
import com.project.project.service.impl.AuthService;
import com.project.project.security.AuthRateLimiter;
import com.project.project.service.impl.InviteService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final InviteService inviteService;
    private final AuthRateLimiter rateLimiter;

    public AuthController(AuthService authService, InviteService inviteService, AuthRateLimiter rateLimiter) {
        this.authService = authService;
        this.inviteService = inviteService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest http) {
        LoginResponse response = authService.login(request, http.getRemoteAddr());
        return ResponseEntity.ok(response);
    }

    // Yalnızca davet linkiyle kayıt
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest http) {
        rateLimiter.checkPublic(http.getRemoteAddr());
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Kayıt sayfası davet linkini kontrol eder: geçerliyse paket süresi, değilse 404
    @GetMapping("/invites/{token}")
    public ResponseEntity<InviteLookupResponse> lookupInvite(@PathVariable String token, HttpServletRequest http) {
        // Davet linkleri tahmin edilmeye çalışılmasın
        rateLimiter.checkPublic(http.getRemoteAddr());
        return ResponseEntity.ok(inviteService.lookup(token));
    }
}
