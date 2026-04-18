package com.my_app.schoolboard.service;

import com.my_app.schoolboard.model.GroupImageType;
import com.my_app.schoolboard.model.GroupPicture;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores group profile/cover files and updates {@link GroupPicture} URLs without embedding
 * storage details in group domain services.
 */
public interface GroupPictureService {

    /**
     * Stores a file for the given image type and returns the public URL (same pattern as posts).
     */
    String storeAndBuildUrl(MultipartFile file, GroupImageType type);

    void deleteStoredUrlIfPresent(String url);

    /**
     * Applies create-time uploads to a new {@link GroupPicture} (may leave URLs null).
     */
    void applyOnCreate(GroupPicture picture, MultipartFile profile, MultipartFile cover);

    /**
     * Applies update: new files replace existing URLs; remove flags clear URLs and delete files.
     */
    void applyOnUpdate(GroupPicture picture, MultipartFile profile, MultipartFile cover,
            boolean removeProfile, boolean removeCover);
}
