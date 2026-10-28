package com.project.project.service.impl;

import com.project.project.dto.DietMealRequest;
import com.project.project.dto.DietPlanRequest;
import com.project.project.dto.DietPlanResponse;
import com.project.project.entity.DietPlan;
import com.project.project.entity.DietPlan.PlanType;
import com.project.project.entity.DietPlanMeal;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.DietPlanInvalidException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.DietPlanRepository;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DietPlanService {

    private final DietPlanRepository dietPlanRepository;
    private final UserRepository userRepository;

    public DietPlanService(DietPlanRepository dietPlanRepository, UserRepository userRepository) {
        this.dietPlanRepository = dietPlanRepository;
        this.userRepository = userRepository;
    }

    // ---------- Danışan ----------

    // Danışanın aktif (en son yazılan) programı; yoksa boş (controller 204 verir)
    @Transactional(readOnly = true)
    public Optional<DietPlanResponse> getMyActivePlan(String username) {
        User client = findUserByUsername(username);
        return dietPlanRepository.findFirstByClientOrderByCreatedAtDesc(client).map(DietPlanResponse::new);
    }

    // ---------- Diyetisyen ----------

    // Danışanın bütün programları, en yeni önce (ilki aktif program)
    @Transactional(readOnly = true)
    public List<DietPlanResponse> listClientPlans(Long clientId) {
        User client = findClientById(clientId);
        return dietPlanRepository.findAllByClientOrderByCreatedAtDesc(client).stream()
                .map(DietPlanResponse::new)
                .toList();
    }

    @Transactional
    public DietPlanResponse createPlan(Long clientId, String dietitianUsername, DietPlanRequest request) {
        User client = findClientById(clientId);
        User dietitian = findUserByUsername(dietitianUsername);

        DietPlan plan = new DietPlan(client, dietitian);
        apply(plan, request);
        return new DietPlanResponse(dietPlanRepository.save(plan));
    }

    @Transactional
    public DietPlanResponse updatePlan(Long clientId, Long planId, DietPlanRequest request) {
        DietPlan plan = findPlanOf(findClientById(clientId), planId);
        apply(plan, request);
        plan.touch();
        return new DietPlanResponse(dietPlanRepository.save(plan));
    }

    @Transactional
    public void deletePlan(Long clientId, Long planId) {
        dietPlanRepository.delete(findPlanOf(findClientById(clientId), planId));
    }

    // ---------- Yardımcılar ----------

    // İstekteki bilgileri programa yazar; öğünlerin tamamı yenilenir
    private void apply(DietPlan plan, DietPlanRequest request) {
        validateDays(request);

        plan.setPlanType(request.getPlanType());
        plan.setTitle(request.getTitle().trim());
        plan.setStartDate(request.getStartDate());
        plan.setNotes(blankToNull(request.getNotes()));

        // Her günün öğünleri 0'dan başlayarak sıralanır (gönderilen sıra korunur)
        Map<Integer, Integer> nextPosition = new HashMap<>();
        List<DietPlanMeal> meals = new ArrayList<>();
        for (DietMealRequest meal : request.getMeals()) {
            int day = meal.getDayIndex();
            int position = nextPosition.merge(day, 1, Integer::sum) - 1;
            String items = cleanItems(meal.getItems());
            if (items.isEmpty()) {
                throw new DietPlanInvalidException("Öğünde en az bir madde olmalı: " + meal.getName().trim());
            }
            meals.add(new DietPlanMeal(plan, day, position, meal.getName().trim(), blankToNull(meal.getTime()), items));
        }
        plan.replaceMeals(meals);
    }

    // Günlük program yalnızca "her gün" (0), haftalık program yalnızca Pazartesi-Pazar (1-7) kullanır
    private void validateDays(DietPlanRequest request) {
        boolean daily = request.getPlanType() == PlanType.DAILY;
        for (DietMealRequest meal : request.getMeals()) {
            int day = meal.getDayIndex();
            if (daily && day != 0) {
                throw new DietPlanInvalidException("Günlük programda öğünler her gün için yazılır");
            }
            if (!daily && (day < 1 || day > 7)) {
                throw new DietPlanInvalidException("Haftalık programda her öğün bir güne (Pazartesi-Pazar) ait olmalı");
            }
        }
    }

    // Satırların başındaki/sonundaki boşlukları ve boş satırları temizler
    private String cleanItems(String items) {
        return Arrays.stream(items.split("\\R"))
                .map(String::trim)
                .filter(line -> !line.isEmpty())
                .collect(Collectors.joining("\n"));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private DietPlan findPlanOf(User client, Long planId) {
        return dietPlanRepository.findByIdAndClient(planId, client)
                .orElseThrow(() -> new DietPlanInvalidException.NotFound("Diyet programı bulunamadı, id: " + planId));
    }

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
}
