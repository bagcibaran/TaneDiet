package com.project.project.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Beklenmeyen hatalar için son yakalayıcı listenin SONUNA eklenir: Spring'in işlediği hatalar bugünkü gibi kalır
    @Override
    public void extendHandlerExceptionResolvers(List<HandlerExceptionResolver> resolvers) {
        resolvers.add(new UnexpectedErrorResolver());
    }
}
