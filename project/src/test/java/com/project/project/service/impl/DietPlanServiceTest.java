package com.project.project.service.impl;

import com.project.project.dto.DietMealRequest;
import com.project.project.dto.DietPlanRequest;
import com.project.project.dto.DietPlanResponse;
import com.project.project.entity.DietPlan;
import com.project.project.entity.DietPlan.PlanType;
import com.project.project.entity.Role;
import com.project.project.entity.User;
import com.project.project.exception.DietPlanInvalidException;
import com.project.project.exception.UserNotFoundException;
import com.project.project.repository.DietPlanRepository;
import com.project.project.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class DietPlanServiceTest {

    @Mock
    private DietPlanRepository dietPlanRepository;

    @Mock
    private UserRepository userRepository;

    private DietPlanService dietPlanService;

    private User client;
    private User dietitian;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        dietPlanService = new DietPlanService(dietPlanRepository, userRepository);

        client = new User("betul", "betul@test.com", "hash");
        client.setId(41L);
        dietitian = new User("diyetisyen", "d@test.com", "hash");
        dietitian.setId(28L);
        dietitian.setRole(Role.DIETITIAN);

        when(userRepository.findById(41L)).thenReturn(Optional.of(client));
        when(userRepository.findById(28L)).thenReturn(Optional.of(dietitian));
        when(userRepository.findByUsername("betul")).thenReturn(Optional.of(client));
        when(userRepository.findByUsername("diyetisyen")).thenReturn(Optional.of(dietitian));
        when(dietPlanRepository.save(any(DietPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    private DietMealRequest meal(int dayIndex, String name, String time, String items) {
        DietMealRequest meal = new DietMealRequest();
        meal.setDayIndex(dayIndex);
        meal.setName(name);
        meal.setTime(time);
        meal.setItems(items);
        return meal;
    }

    private DietPlanRequest request(PlanType type, List<DietMealRequest> meals) {
        DietPlanRequest request = new DietPlanRequest();
        request.setPlanType(type);
        request.setTitle("Diyet Listesi");
        request.setStartDate(LocalDate.of(2026, 10, 28));
        request.setMeals(meals);
        return request;
    }

    @Test
    void createPlan_daily_savesMealsInOrderWithPositions() {
        DietPlanRequest request = request(PlanType.DAILY, List.of(
                meal(0, "Uyanış", "10:30", "2 adet ceviz\n1 bardak kahve"),
                meal(0, "Kahvaltı", "14:00", "2 haşlanmış yumurta")));

        DietPlanResponse response = dietPlanService.createPlan(41L, "diyetisyen", request);

        assertEquals("DAILY", response.getPlanType());
        assertEquals(2, response.getMeals().size());
        assertEquals("Uyanış", response.getMeals().get(0).getName());
        assertEquals(0, response.getMeals().get(0).getPosition());
        assertEquals(1, response.getMeals().get(1).getPosition());
        assertEquals("diyetisyen", response.getCreatedBy());
    }

    @Test
    void createPlan_weekly_positionsRestartPerDay() {
        DietPlanRequest request = request(PlanType.WEEKLY, List.of(
                meal(1, "Kahvaltı", null, "yumurta"),
                meal(1, "Akşam", null, "sebze yemeği"),
                meal(2, "Kahvaltı", null, "peynir")));

        DietPlanResponse response = dietPlanService.createPlan(41L, "diyetisyen", request);

        assertEquals(1, response.getMeals().get(1).getPosition());
        assertEquals(0, response.getMeals().get(2).getPosition());
    }

    @Test
    void createPlan_dailyWithWeekday_isRejected() {
        DietPlanRequest request = request(PlanType.DAILY, List.of(meal(3, "Kahvaltı", null, "yumurta")));

        assertThrows(DietPlanInvalidException.class, () -> dietPlanService.createPlan(41L, "diyetisyen", request));
        verify(dietPlanRepository, never()).save(any());
    }

    @Test
    void createPlan_weeklyWithEveryDayIndex_isRejected() {
        DietPlanRequest request = request(PlanType.WEEKLY, List.of(meal(0, "Kahvaltı", null, "yumurta")));

        assertThrows(DietPlanInvalidException.class, () -> dietPlanService.createPlan(41L, "diyetisyen", request));
    }

    @Test
    void createPlan_forDietitian_isNotFound() {
        DietPlanRequest request = request(PlanType.DAILY, List.of(meal(0, "Kahvaltı", null, "yumurta")));

        assertThrows(UserNotFoundException.class, () -> dietPlanService.createPlan(28L, "diyetisyen", request));
    }

    @Test
    void updatePlan_replacesMealsAndKeepsCreator() {
        DietPlan existing = new DietPlan(client, dietitian);
        existing.setId(7L);
        when(dietPlanRepository.findByIdAndClient(7L, client)).thenReturn(Optional.of(existing));
        DietPlanRequest request = request(PlanType.DAILY, List.of(meal(0, "Akşam", "19:00", "çorba")));

        DietPlanResponse response = dietPlanService.updatePlan(41L, 7L, request);

        assertEquals(1, response.getMeals().size());
        assertEquals("Akşam", response.getMeals().get(0).getName());
        assertEquals("diyetisyen", response.getCreatedBy());
    }

    @Test
    void updatePlan_planOfAnotherClient_isNotFound() {
        when(dietPlanRepository.findByIdAndClient(99L, client)).thenReturn(Optional.empty());
        DietPlanRequest request = request(PlanType.DAILY, List.of(meal(0, "Akşam", null, "çorba")));

        assertThrows(DietPlanInvalidException.NotFound.class, () -> dietPlanService.updatePlan(41L, 99L, request));
    }

    @Test
    void getMyActivePlan_returnsLatestOrEmpty() {
        when(dietPlanRepository.findFirstByClientOrderByCreatedAtDesc(client)).thenReturn(Optional.empty());
        assertTrue(dietPlanService.getMyActivePlan("betul").isEmpty());

        DietPlan latest = new DietPlan(client, dietitian);
        latest.setPlanType(PlanType.DAILY);
        latest.setTitle("Yeni liste");
        latest.setStartDate(LocalDate.of(2026, 10, 28));
        when(dietPlanRepository.findFirstByClientOrderByCreatedAtDesc(client)).thenReturn(Optional.of(latest));
        assertEquals("Yeni liste", dietPlanService.getMyActivePlan("betul").orElseThrow().getTitle());
    }

    @Test
    void createPlan_trimsBlankTimeAndNotesToNull() {
        DietPlanRequest request = request(PlanType.DAILY, List.of(meal(0, " Kahvaltı ", "  ", "yumurta\n\n  ")));
        request.setNotes("   ");

        DietPlanResponse response = dietPlanService.createPlan(41L, "diyetisyen", request);

        assertNull(response.getNotes());
        assertNull(response.getMeals().get(0).getTime());
        assertEquals("Kahvaltı", response.getMeals().get(0).getName());
        assertEquals("yumurta", response.getMeals().get(0).getItems());
    }
}
