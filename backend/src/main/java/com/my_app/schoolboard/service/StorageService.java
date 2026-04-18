package com.my_app.schoolboard.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    String store(MultipartFile file);

    String store(MultipartFile file, String folder);

    Stream<Path> loadAll();

    Path load(String filename);

    Resource loadAsResource(String filename);

    void delete(String filename);

    /**
     * Deletes a file under {@code uploads/} given a full URL or path containing {@code /uploads/...}.
     */
    void deleteByUploadsUrl(String url);

    void deleteAll();
}
