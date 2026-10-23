package com.project.project.service.impl;

import com.project.project.dto.WeightEntryCreateRequest;
import com.project.project.dto.WeightEntryResponse;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
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

    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + username));
    }
}