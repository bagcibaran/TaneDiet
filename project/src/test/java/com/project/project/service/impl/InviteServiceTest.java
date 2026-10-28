package com.project.project.service.impl;

import com.project.project.dto.InviteCreateRequest;
import com.project.project.dto.InviteResponse;
import com.project.project.entity.Invite;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.exception.InviteInvalidException;
import com.project.project.repository.InviteRepository;
import com.project.project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class InviteServiceTest {

    @Mock
    private InviteRepository inviteRepository;

    @Mock
    private UserRepository userRepository;

    private InviteService service;
    private User dietitian;
    // Saat sabit: 28 Ekim 2026 12:00 (Türkiye)
    private final LocalDateTime now = LocalDateTime.of(2026, 10, 28, 12, 0);

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        Clock clock = Clock.fixed(Instant.parse("2026-10-28T09:00:00Z"), ZoneId.of("Europe/Istanbul"));
        service = new InviteService(inviteRepository, userRepository, clock);

        dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setId(28L);
        dietitian.setRole(Role.DIETITIAN);
        when(userRepository.findByUsername("diyetisyen")).thenReturn(Optional.of(dietitian));
        when(inviteRepository.save(any(Invite.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private InviteCreateRequest request(Integer months, String note) {
        InviteCreateRequest request = new InviteCreateRequest();
        request.setMonths(months);
        request.setNote(note);
        return request;
    }

    private Invite invite(LocalDateTime expiresAt) {
        return new Invite(dietitian, "tok", null, 3, now.minusDays(1), expiresAt);
    }

    @Test
    void createRejectsFourMonths() {
        assertThrows(AccessRuleException.class, () -> service.create("diyetisyen", request(4, null)));
    }

    @Test
    void createSetsSevenDayExpiryAndTrimsNote() {
        InviteResponse blank = service.create("diyetisyen", request(3, "  "));
        InviteResponse named = service.create("diyetisyen", request(1, "  Ayşe Y. "));

        assertNull(blank.getNote());
        assertEquals("Ayşe Y.", named.getNote());
        assertEquals(now, blank.getCreatedAt());
        assertEquals(now.plusDays(7), blank.getExpiresAt());
        assertEquals(3, blank.getMonths());
    }

    @Test
    void tokensAreUniqueAndUrlSafe() {
        String first = service.create("diyetisyen", request(1, null)).getToken();
        String second = service.create("diyetisyen", request(1, null)).getToken();

        assertNotEquals(first, second);
        assertTrue(first.matches("[A-Za-z0-9_-]{43}"), first);
    }

    @Test
    void lookupExpiredThrows() {
        when(inviteRepository.findByToken("tok")).thenReturn(Optional.of(invite(now.minusMinutes(1))));

        assertThrows(InviteInvalidException.class, () -> service.lookup("tok"));
    }

    @Test
    void lookupUsedThrows() {
        Invite used = invite(now.plusDays(3));
        used.markUsed(new User("x", "x@test.com", "h"), now.minusHours(1));
        when(inviteRepository.findByToken("tok")).thenReturn(Optional.of(used));

        assertThrows(InviteInvalidException.class, () -> service.lookup("tok"));
    }

    @Test
    void lookupReturnsMonths() {
        when(inviteRepository.findByToken("tok")).thenReturn(Optional.of(invite(now.plusDays(3))));

        assertEquals(3, service.lookup("tok").getMonths());
    }

    @Test
    void lockUsableUsedInviteThrows() {
        Invite used = invite(now.plusDays(3));
        used.markUsed(new User("x", "x@test.com", "h"), now.minusHours(1));
        when(inviteRepository.findByTokenForUpdate("tok")).thenReturn(Optional.of(used));

        assertThrows(InviteInvalidException.class, () -> service.lockUsable("tok"));
    }

    @Test
    void lockUsableUnknownTokenThrows() {
        when(inviteRepository.findByTokenForUpdate("nope")).thenReturn(Optional.empty());

        assertThrows(InviteInvalidException.class, () -> service.lockUsable("nope"));
    }

    @Test
    void markUsedSetsUserAndTime() {
        Invite open = invite(now.plusDays(3));
        User client = new User("ayse", "a@test.com", "h");

        service.markUsed(open, client);

        assertSame(client, open.getUsedBy());
        assertEquals(now, open.getUsedAt());
    }

    @Test
    void deleteUsedInviteThrows() {
        Invite used = invite(now.plusDays(3));
        used.markUsed(new User("x", "x@test.com", "h"), now);
        when(inviteRepository.findById(5L)).thenReturn(Optional.of(used));

        assertThrows(InviteInvalidException.class, () -> service.delete(5L));
        verify(inviteRepository, never()).delete(any());
    }
}
