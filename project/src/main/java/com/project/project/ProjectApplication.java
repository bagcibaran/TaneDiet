package com.project.project;

import com.project.project.config.TimeConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProjectApplication {

	public static void main(String[] args) {
		// Saat dilimi Spring başlamadan ayarlanır (bkz. TimeConfig.applyDefaultZone)
		TimeConfig.applyDefaultZone();
		SpringApplication.run(ProjectApplication.class, args);
	}

}
