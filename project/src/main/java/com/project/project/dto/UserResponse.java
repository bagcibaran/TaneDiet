package com.project.project.dto;

import com.project.project.entity.User;
import com.project.project.entity.Role;

public class UserResponse {


    private Long id;
    private String username;
    private String email;
    private Role role;

    public UserResponse(User user){
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
    }

    public Long getId() {
        return id;
    }
    
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }
}
