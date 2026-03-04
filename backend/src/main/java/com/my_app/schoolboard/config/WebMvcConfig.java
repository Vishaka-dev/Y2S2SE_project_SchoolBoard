package com.my_app.schoolboard.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/posts}")
    private String uploadDir;

    @Value("${file.profile-image-dir:uploads/profile-images}")
    private String profileImageDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve post files from the upload directory via /uploads/posts/** URL
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/posts/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");

        // Serve profile images from the profile-images directory via
        // /uploads/profile-images/** URL
        Path profileImagePath = Paths.get(profileImageDir);
        String profileImageAbsolutePath = profileImagePath.toFile().getAbsolutePath();
        registry.addResourceHandler("/uploads/profile-images/**")
                .addResourceLocations("file:" + profileImageAbsolutePath + "/");
    }
}