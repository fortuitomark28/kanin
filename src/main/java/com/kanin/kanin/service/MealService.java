package com.kanin.kanin.service;

import com.kanin.kanin.model.Meal;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MealService {

    private List<Meal> meals = new ArrayList<>();
    private AtomicLong counter = new AtomicLong();

    public List<Meal> getAllMeals() {
        return meals;
    }

    public Meal addMeal(Meal meal) {
        meal.setId(counter.incrementAndGet());
        meals.add(meal);
        return meal;
    }

    public boolean deleteMeal(Long id) {
        return meals.removeIf(meal -> meal.getId().equals(id));
    }

    public double getTotalSpent() {
        return meals.stream().mapToDouble(Meal::getAmount).sum();
    }
}