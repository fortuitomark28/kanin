package com.kanin.kanin.model;

public class Meal {
    private Long id;
    private String name;
    private String category;
    private double amount;
    private String date;

    public Meal() {}

    public Meal(Long id, String name, String category, double amount, String date) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.date = date;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}