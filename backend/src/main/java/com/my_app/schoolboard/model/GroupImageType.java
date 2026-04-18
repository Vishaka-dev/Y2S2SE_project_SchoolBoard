package com.my_app.schoolboard.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Folder and public URL prefix for group images (extensible for future types).
 */
@Getter
@RequiredArgsConstructor
public enum GroupImageType {

    PROFILE("groups/profile-pic", "/uploads/groups/profile-pic/"),
    COVER("groups/cover-pic", "/uploads/groups/cover-pic/");

    private final String storageFolder;
    private final String urlPathPrefix;
}
