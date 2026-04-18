package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.model.GroupImageType;
import com.my_app.schoolboard.model.GroupPicture;
import com.my_app.schoolboard.service.GroupPictureService;
import com.my_app.schoolboard.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class GroupPictureServiceImpl implements GroupPictureService {

    private final StorageService storageService;

    @Override
    public String storeAndBuildUrl(MultipartFile file, GroupImageType type) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String filename = storageService.store(file, type.getStorageFolder());
        return ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(type.getUrlPathPrefix())
                .path(filename)
                .toUriString();
    }

    @Override
    public void deleteStoredUrlIfPresent(String url) {
        storageService.deleteByUploadsUrl(url);
    }

    @Override
    public void applyOnCreate(GroupPicture picture, MultipartFile profile, MultipartFile cover) {
        if (profile != null && !profile.isEmpty()) {
            picture.setProfilePictureUrl(storeAndBuildUrl(profile, GroupImageType.PROFILE));
        }
        if (cover != null && !cover.isEmpty()) {
            picture.setCoverPictureUrl(storeAndBuildUrl(cover, GroupImageType.COVER));
        }
    }

    @Override
    public void applyOnUpdate(GroupPicture picture, MultipartFile profile, MultipartFile cover,
            boolean removeProfile, boolean removeCover) {
        if (removeProfile) {
            deleteStoredUrlIfPresent(picture.getProfilePictureUrl());
            picture.setProfilePictureUrl(null);
        } else if (profile != null && !profile.isEmpty()) {
            deleteStoredUrlIfPresent(picture.getProfilePictureUrl());
            picture.setProfilePictureUrl(storeAndBuildUrl(profile, GroupImageType.PROFILE));
        }

        if (removeCover) {
            deleteStoredUrlIfPresent(picture.getCoverPictureUrl());
            picture.setCoverPictureUrl(null);
        } else if (cover != null && !cover.isEmpty()) {
            deleteStoredUrlIfPresent(picture.getCoverPictureUrl());
            picture.setCoverPictureUrl(storeAndBuildUrl(cover, GroupImageType.COVER));
        }
    }
}
