package com.project.project.service.impl;

import com.project.project.dto.WeightEntryCreateRequest;
import com.project.project.dto.WeightEntryResponse;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.UserNotFoundException;
import com.project.project.exception.WeightEntryNotFoundException;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WeightEntryService {

    private final WeightEntryRepository weightEntryRepository;
    private final UserRepository userRepository;

    public WeightEntryService(WeightEntryRepository weightEntryRepository, UserRepository userRepository) {
        this.weightEntryRepository = weightEntryRepository;
        this.userRepository = userRepository;
    }

    // ---------- Danışan: kendi kayıtları ----------

    public WeightEntryResponse addMyEntry(String username, WeightEntryCreateRequest request) {
        User user = findUserByUsername(username);

        WeightEntry entry = new WeightEntry(
                user,
                request.getWeightKg(),
                request.getMeasuredOn(),
                user
        );

        WeightEntry savedEntry = weightEntryRepository.save(entry);
        return new WeightEntryResponse(savedEntry);
    }

    public List<WeightEntryResponse> getMyEntries(String username) {
        User user = findUserByUsername(username);

        return weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(user)
                .stream()
                .map(WeightEntryResponse::new)
                .toList();
    }

    public void deleteMyEntry(String username, Long entryId) {
        User user = findUserByUsername(username);
        WeightEntry entry = findEntryOf(user, entryId);

        // Danışan yalnızca kendi girdiği kaydı silebilir; diyetisyenin girdiğini silemez
        if (!entry.getEnteredBy().getId().equals(user.getId())) {
            throw new AccessDeniedException("Diyetisyenin girdiği kayıtlar silinemez");
        }

        weightEntryRepository.delete(entry);
    }

    // ---------- Diyetisyen: bir danışanın kayıtları ----------

    public List<WeightEntryResponse> getClientEntries(Long clientId) {
        User client = findClientById(clientId);

        return weightEntryRepository.findAllByUserOrderByMeasuredOnDescCreatedAtDesc(client)
                .stream()
                .map(WeightEntryResponse::new)
                .toList();
    }

    public WeightEntryResponse addEntryForClient(Long clientId, String dietitianUsername, WeightEntryCreateRequest request) {
        User client = findClientById(clientId);
        User dietitian = findUserByUsername(dietitianUsername);

        WeightEntry entry = new WeightEntry(
                client,
                request.getWeightKg(),
                request.getMeasuredOn(),
                dietitian
        );

        WeightEntry savedEntry = weightEntryRepository.save(entry);
        return new WeightEntryResponse(savedEntry);
    }

    public void deleteClientEntry(Long clientId, Long entryId) {
        User client = findClientById(clientId);
        WeightEntry entry = findEntryOf(client, entryId);

        weightEntryRepository.delete(entry);
    }

    // ---------- Yardımcılar ----------

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + username));
    }

    private User findClientById(Long clientId) {
        User user = userRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Danışan bulunamadı, id: " + clientId));

        if (user.getRole() != Role.CLIENT) {
            throw new UserNotFoundException("Danışan bulunamadı, id: " + clientId);
        }

        return user;
    }

    // Kayıt yoksa veya bu kullanıcıya ait değilse 404
    private WeightEntry findEntryOf(User user, Long entryId) {
        return weightEntryRepository.findByIdAndUser(entryId, user)
                .orElseThrow(() -> new WeightEntryNotFoundException("Kilo kaydı bulunamadı, id: " + entryId));
    }
}