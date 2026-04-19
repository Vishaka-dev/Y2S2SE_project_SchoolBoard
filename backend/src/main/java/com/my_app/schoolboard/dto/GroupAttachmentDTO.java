package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.GroupAttachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Attachment DTO for group messages
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupAttachmentDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private Long fileSize;
    private String fileType;

    public static GroupAttachmentDTO fromAttachment(GroupAttachment attachment) {
        if (attachment == null) return null;
        return GroupAttachmentDTO.builder()
                .id(attachment.getId())
                .fileName(attachment.getFileName())
                .fileUrl(attachment.getFileUrl())
                .fileSize(attachment.getFileSize())
                .fileType(attachment.getFileType())
                .build();
    }
}
