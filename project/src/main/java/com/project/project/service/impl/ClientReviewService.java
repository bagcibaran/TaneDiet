package com.project.project.service.impl;

import com.project.project.dto.ClientActivityResponse;
import com.project.project.dto.ClientOverviewResponse;
import com.project.project.entity.ClientReview;
import com.project.project.entity.IntakeForm;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.entity.WeightEntry;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.ClientReviewRepository;
import com.project.project.repository.IntakeFormRepository;
import com.project.project.repository.UserRepository;
import com.project.project.repository.WeightEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// Diyetisyen bildirimleri: danışan, diyetisyen en son baktığından beri ne değiştirdi?
@Service
public class ClientReviewService {

    // Diyetisyen bir danışana hiç bakmadıysa her şey yenidir
    static final LocalDateTime NEVER = LocalDateTime.of(1970, 1, 1, 0, 0);

    private final UserRepository userRepository;
    private final ClientReviewRepository clientReviewRepository;
    private final IntakeFormRepository intakeFormRepository;
    private final WeightEntryRepository weightEntryRepository;

    public ClientReviewService(
            UserRepository userRepository,
            ClientReviewRepository clientReviewRepository,
            IntakeFormRepository intakeFormRepository,
            WeightEntryRepository weightEntryRepository
    ) {
        this.userRepository = userRepository;
        this.clientReviewRepository = clientReviewRepository;
        this.intakeFormRepository = intakeFormRepository;
        this.weightEntryRepository = weightEntryRepository;
    }

    // Danışan listesi: her kart için bildirimler
    public List<ClientOverviewResponse> listClients() {
        return userRepository.findAllByRoleOrderByUsernameAsc(Role.CLIENT).stream()
                .map(client -> {
                    Optional<ClientReview> review = clientReviewRepository.findByClient(client);
                    LocalDateTime since = since(review);
                    // Yalnızca danışanın kendi girdiği kilolar; diyetisyenin girdiklerini zaten biliyor
                    long newWeights = weightEntryRepository.countByUserAndEnteredByAndCreatedAtAfter(client, client, since);
                    String intakeStatus = intakeStatus(intakeFormRepository.findByUser(client), review);
                    return new ClientOverviewResponse(client, newWeights, intakeStatus);
                })
                .toList();
    }

    // Danışan sayfasında neyin yeni olduğunu söyler (henüz "görüldü" yapmaz)
    public ClientActivityResponse getActivity(Long clientId) {
        User client = findClientById(clientId);
        Optional<ClientReview> review = clientReviewRepository.findByClient(client);
        Optional<IntakeForm> form = intakeFormRepository.findByUser(client);

        List<Long> newWeightIds = weightEntryRepository
                .findAllByUserAndEnteredByAndCreatedAtAfter(client, client, since(review))
                .stream()
                .map(WeightEntry::getId)
                .toList();
        List<String> changedFields = form.map(IntakeForm::getChangedFields).orElse(List.of());

        return new ClientActivityResponse(newWeightIds, intakeStatus(form, review), changedFields);
    }

    // Diyetisyen danışanın sayfasını açtı: bildirimler kaybolur
    @Transactional
    public void markReviewed(Long clientId) {
        User client = findClientById(clientId);

        ClientReview review = clientReviewRepository.findByClient(client).orElseGet(() -> new ClientReview(client));
        review.markReviewed();
        clientReviewRepository.save(review);

        intakeFormRepository.findByUser(client).ifPresent(form -> {
            form.clearChangedFields();
            intakeFormRepository.save(form);
        });
    }

    private LocalDateTime since(Optional<ClientReview> review) {
        return review.map(ClientReview::getReviewedAt).orElse(NEVER);
    }

    private String intakeStatus(Optional<IntakeForm> form, Optional<ClientReview> review) {
        if (form.isEmpty()) {
            return "MISSING";
        }
        if (review.isEmpty() || form.get().getCreatedAt().isAfter(review.get().getReviewedAt())) {
            return "NEW";
        }
        if (!form.get().getChangedFields().isEmpty()) {
            return "UPDATED";
        }
        return "SEEN";
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
