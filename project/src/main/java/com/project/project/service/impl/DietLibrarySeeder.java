package com.project.project.service.impl;

import com.project.project.entity.MealTemplate;
import com.project.project.entity.QuickPickCategory;
import com.project.project.entity.User;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.DietLibrarySeedRepository;
import com.project.project.repository.MealTemplateRepository;
import com.project.project.repository.QuickPickCategoryRepository;
import com.project.project.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// Diyetisyene örnek hazır öğünleri ve hızlı maddeleri bir kez yükler.
// Kendi transaction'ında çalışır ve okumadan önce biter: aynı anda gelen ikinci istek de
// (StrictMode) işaret satırının kilidini bekler, sonra yüklenmiş örnekleri görür.
@Service
public class DietLibrarySeeder {

    private final MealTemplateRepository mealTemplateRepository;
    private final QuickPickCategoryRepository categoryRepository;
    private final DietLibrarySeedRepository seedRepository;
    private final UserRepository userRepository;

    public DietLibrarySeeder(
            MealTemplateRepository mealTemplateRepository,
            QuickPickCategoryRepository categoryRepository,
            DietLibrarySeedRepository seedRepository,
            UserRepository userRepository
    ) {
        this.mealTemplateRepository = mealTemplateRepository;
        this.categoryRepository = categoryRepository;
        this.seedRepository = seedRepository;
        this.userRepository = userRepository;
    }

    // İşaret yeni eklendiyse (bu istek ilk) örnekleri yükler; silinen örnekler bir daha gelmez
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void seedIfNeeded(String ownerUsername) {
        User owner = userRepository.findByUsername(ownerUsername)
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı: " + ownerUsername));
        if (seedRepository.insertIfAbsent(owner.getId()) != 1) {
            return;
        }
        List<MealTemplate> meals = DietLibraryDefaults.MEALS.stream()
                .map(preset -> new MealTemplate(owner, preset.name(), preset.time(), ""))
                .toList();
        mealTemplateRepository.saveAll(meals);

        List<QuickPickCategory> categories = new ArrayList<>();
        for (Map.Entry<String, List<String>> entry : DietLibraryDefaults.CATEGORIES.entrySet()) {
            QuickPickCategory category = new QuickPickCategory(owner, entry.getKey(), categories.size());
            entry.getValue().forEach(category::addItem);
            categories.add(category);
        }
        categoryRepository.saveAll(categories);
    }
}
