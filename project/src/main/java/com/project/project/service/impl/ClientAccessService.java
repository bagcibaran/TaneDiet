package com.project.project.service.impl;

import com.project.project.dto.ClientAccessRequest;
import com.project.project.dto.ClientAccessResponse;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.AccessRuleException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Set;

// Danışanın hizmet süresi: kilitli mi, kaç gün kaldı ve diyetisyenin dört işlemi.
// accessUntil son gündür (dahil); null = süresiz. Hiçbir işlem veri silmez.
@Service
public class ClientAccessService {

    // Satılan paket süreleri (ay)
    public static final Set<Integer> PACKAGE_MONTHS = Set.of(1, 3, 6);

    private final UserRepository userRepository;
    private final Clock clock;

    public ClientAccessService(UserRepository userRepository, Clock clock) {
        this.userRepository = userRepository;
        this.clock = clock;
    }

    // Bugün, Türkiye saatine göre (Clock bean'i)
    public LocalDate today() {
        return LocalDate.now(clock);
    }

    // Yalnızca danışan kilitlenir: son günü bugünden önceyse. Son gün hâlâ açıktır.
    public boolean isLocked(User user) {
        return user.getRole() == Role.CLIENT
                && user.getAccessUntil() != null
                && user.getAccessUntil().isBefore(today());
    }

    // Kalan gün (son gün 0); süresiz veya kilitliyse null
    public Integer daysLeft(User user) {
        if (user.getAccessUntil() == null || isLocked(user)) {
            return null;
        }
        return (int) ChronoUnit.DAYS.between(today(), user.getAccessUntil());
    }

    public ClientAccessResponse toResponse(User user) {
        return new ClientAccessResponse(user.getAccessUntil(), isLocked(user), daysLeft(user));
    }

    // Paket süresi 1, 3 veya 6 ay olabilir
    public static void requirePackageMonths(Integer months) {
        if (months == null || !PACKAGE_MONTHS.contains(months)) {
            throw new AccessRuleException("Paket süresi 1, 3 veya 6 ay olabilir");
        }
    }

    @Transactional(readOnly = true)
    public ClientAccessResponse getAccess(Long clientId) {
        return toResponse(findClientById(clientId));
    }

    @Transactional
    public ClientAccessResponse updateAccess(Long clientId, ClientAccessRequest request) {
        User client = findClientById(clientId);
        switch (request.getAction()) {
            case ADD_MONTHS -> {
                requirePackageMonths(request.getMonths());
                // Kilitli veya süresizse bugünden, hâlâ açıksa mevcut son günden uzatılır
                LocalDate base = client.getAccessUntil() == null || isLocked(client) ? today() : client.getAccessUntil();
                LocalDate end = base.plusMonths(request.getMonths());
                // Ayın son günü biten paket yine ayın son gününde biter (31 Oca → 28 Şub → 31 Mar; 28 Mar'a kaymaz)
                if (base.getDayOfMonth() == base.lengthOfMonth()) {
                    end = end.withDayOfMonth(end.lengthOfMonth());
                }
                client.setAccessUntil(end);
            }
            case SET_DATE -> {
                if (request.getDate() == null) {
                    throw new AccessRuleException("Bitiş tarihi gerekli");
                }
                client.setAccessUntil(request.getDate());
            }
            case UNLIMITED -> client.setAccessUntil(null);
            // Dün = bugünden önce: hemen kilitlenir
            case CLOSE_NOW -> client.setAccessUntil(today().minusDays(1));
        }
        return toResponse(userRepository.save(client));
    }

    private User findClientById(Long clientId) {
        User user = userRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Danışan bulunamadı, id: " + clientId));
        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Danışan bulunamadı, id: " + clientId);
        }
        return user;
    }
}
