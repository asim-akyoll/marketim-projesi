package com.marketim.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MarketimBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(MarketimBackendApplication.class, args);
	}



}
