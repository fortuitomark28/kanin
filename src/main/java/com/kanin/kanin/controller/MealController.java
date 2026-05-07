package com.kanin.kanin.controller;

import com.kanin.kanin.model.Meal;
import com.kanin.kanin.service.MealService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "*")
public class MealController {

    @Autowired
    private MealService mealService;

    @GetMapping
    public List<Meal> getAllMeals() {
        return mealService.getAllMeals();
    }

    @PostMapping
    public Meal addMeal(@RequestBody Meal meal) {
        return mealService.addMeal(meal);
    }

    @DeleteMapping("/{id}")
    public String deleteMeal(@PathVariable Long id) {
        boolean deleted = mealService.deleteMeal(id);
        return deleted ? "Deleted successfully" : "Meal not found";
    }

    @GetMapping("/total")
    public double getTotalSpent() {
        return mealService.getTotalSpent();
    }
}