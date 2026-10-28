package com.project.project.security;

import com.project.project.entity.User;
import com.project.project.repository.UserRepository;
import com.project.project.service.impl.ClientAccessService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JwtAuthFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain chain;

    private JwtAuthFilter filter;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Bugün = 28 Ekim 2026
        Clock clock = Clock.fixed(Instant.parse("2026-10-28T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        filter = new JwtAuthFilter(jwtService, userRepository, new ClientAccessService(userRepository, clock));

        Claims claims = Jwts.claims().subject("ayse").add("role", "CLIENT").build();
        when(jwtService.parseClaims("tok")).thenReturn(claims);
    }

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private MockHttpServletRequest request(String path) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        request.setServletPath(path);
        request.addHeader("Authorization", "Bearer tok");
        return request;
    }

    private void lockedClient() {
        User client = new User("ayse", "ayse@test.com", "hash");
        client.setAccessUntil(LocalDate.of(2026, 10, 27));
        when(userRepository.findByUsername("ayse")).thenReturn(Optional.of(client));
    }

    @Test
    void lockedClientGets423() throws Exception {
        lockedClient();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("/weights"), response, chain);

        assertEquals(423, response.getStatus());
        assertTrue(response.getContentAsString().contains("Hizmet süren doldu"));
        verify(chain, never()).doFilter(any(), any());
    }

    // Eski (kilitli) token telefonda kalsa bile giriş ve davet sayfaları çalışmalı
    @Test
    void authPathsSkipLockCheck() throws Exception {
        lockedClient();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("/auth/invites/abc"), response, chain);

        assertEquals(200, response.getStatus());
        verify(chain).doFilter(any(), any());
    }

    // Kullanıcı adı değişmiş ya da kullanıcı silinmiş: "süren doldu" değil, tanınmayan oturum (sonra 401)
    @Test
    void missingUserIsUnauthenticatedNot423() throws Exception {
        when(userRepository.findByUsername("ayse")).thenReturn(Optional.empty());
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("/weights"), response, chain);

        assertNotEquals(423, response.getStatus());
        verify(chain).doFilter(any(), any());
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void activeClientIsAuthenticated() throws Exception {
        User client = new User("ayse", "ayse@test.com", "hash");
        client.setAccessUntil(LocalDate.of(2026, 10, 28));
        when(userRepository.findByUsername("ayse")).thenReturn(Optional.of(client));

        filter.doFilter(request("/weights"), new MockHttpServletResponse(), chain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
