package com.project.project.service.impl;

import com.project.project.dto.LoginRequest;
import com.project.project.dto.RegisterRequest;
import com.project.project.entity.Invite;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.exception.ClientAccessLockedException;
import com.project.project.exception.InviteInvalidException;
import com.project.project.exception.TooManyAttemptsException;
import com.project.project.repository.UserRepository;
import com.project.project.security.AuthRateLimiter;
import com.project.project.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private InviteService inviteService;

    private AuthService authService;
    private Invite invite;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Bugün = 28 Ekim 2026; hizmet süresi kuralları gerçek sınıfla
        Clock clock = Clock.fixed(Instant.parse("2026-10-28T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        ClientAccessService access = new ClientAccessService(userRepository, clock);
        authService = new AuthService(userRepository, passwordEncoder, jwtService, inviteService, access, new AuthRateLimiter(clock));

        User dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setRole(Role.DIETITIAN);
        invite = new Invite(dietitian, "tok", null, 3, LocalDateTime.of(2026, 10, 27, 10, 0), LocalDateTime.of(2026, 11, 3, 10, 0));

        when(passwordEncoder.encode("Sifre123!")).thenReturn("encoded");
        when(passwordEncoder.matches("Sifre123!", "encoded")).thenReturn(true);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt");
    }

    private RegisterRequest registerRequest(String token) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("ayse");
        request.setEmail("ayse@test.com");
        request.setPassword("Sifre123!");
        request.setInviteToken(token);
        return request;
    }

    private LoginRequest loginRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail("ayse@test.com");
        request.setPassword("Sifre123!");
        return request;
    }

    @Test
    void registerWithoutValidInviteFails() {
        when(inviteService.lockUsable("bad")).thenThrow(new InviteInvalidException());

        AccessRuleException error = assertThrows(AccessRuleException.class, () -> authService.register(registerRequest("bad")));

        assertEquals(InviteInvalidException.MESSAGE, error.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerSetsAccessFromToday() {
        when(inviteService.lockUsable("tok")).thenReturn(invite);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        authService.register(registerRequest("tok"));

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertEquals(Role.CLIENT, saved.getValue().getRole());
        assertEquals("encoded", saved.getValue().getPassword());
        assertEquals(LocalDate.of(2027, 1, 28), saved.getValue().getAccessUntil());
        verify(inviteService).markUsed(invite, saved.getValue());
    }

    // E-posta zaten kayıtlıysa (409) davet kullanılmış sayılmaz: kişi düzeltip aynı linkle tekrar deneyebilir
    @Test
    void registerDuplicateKeepsInviteUnused() {
        when(inviteService.lockUsable("tok")).thenReturn(invite);
        when(userRepository.save(any(User.class))).thenThrow(new DataIntegrityViolationException("uk_app_user_email"));

        assertThrows(DataIntegrityViolationException.class, () -> authService.register(registerRequest("tok")));

        verify(inviteService, never()).markUsed(any(), any());
        assertNull(invite.getUsedAt());
    }

    @Test
    void loginLockedClientThrows423Exception() {
        User client = new User("ayse", "ayse@test.com", "encoded");
        client.setAccessUntil(LocalDate.of(2026, 10, 27));
        when(userRepository.findByEmail("ayse@test.com")).thenReturn(Optional.of(client));

        assertThrows(ClientAccessLockedException.class, () -> authService.login(loginRequest(), "1.1.1.1"));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void loginLastDayClientSucceeds() {
        User client = new User("ayse", "ayse@test.com", "encoded");
        client.setAccessUntil(LocalDate.of(2026, 10, 28));
        when(userRepository.findByEmail("ayse@test.com")).thenReturn(Optional.of(client));

        assertEquals("jwt", authService.login(loginRequest(), "1.1.1.1").getToken());
    }

    // 5 hatalı denemeden sonra doğru şifre de 15 dakika kabul edilmez
    @Test
    void fiveWrongPasswordsBlockLogin() {
        User client = new User("ayse", "ayse@test.com", "encoded");
        when(userRepository.findByEmail("ayse@test.com")).thenReturn(Optional.of(client));
        LoginRequest wrong = loginRequest();
        wrong.setPassword("yanlis");

        for (int i = 0; i < 5; i++) {
            assertThrows(com.project.project.exception.UserNotFoundException.class, () -> authService.login(wrong, "1.1.1.1"));
        }

        assertThrows(TooManyAttemptsException.class, () -> authService.login(loginRequest(), "1.1.1.1"));
        verify(jwtService, never()).generateToken(any());
    }

    // Bilinmeyen e-postada da şifre karşılaştırması yapılır: yanıt süresi hesabın var olup olmadığını ele vermesin
    @Test
    void unknownEmailStillChecksAPassword() {
        when(userRepository.findByEmail("yok@test.com")).thenReturn(Optional.empty());
        LoginRequest request = loginRequest();
        request.setEmail("yok@test.com");

        assertThrows(com.project.project.exception.UserNotFoundException.class, () -> authService.login(request, "1.1.1.1"));

        verify(passwordEncoder).matches(eq("Sifre123!"), any());
    }
}
