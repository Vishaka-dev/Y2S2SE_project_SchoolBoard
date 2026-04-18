package com.my_app.schoolboard.service;

import com.my_app.schoolboard.dto.AttachmentDTO;
import com.my_app.schoolboard.model.Attachment;
import com.my_app.schoolboard.model.Message;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.AttachmentRepository;
import com.my_app.schoolboard.repository.MessageRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AttachmentService
 * Handles attachment operations for messages
 * Features:
 * - Upload file attachments to messages
 * - Download attachments
 * - Delete attachments
 * - Fetch attachments for a message
 * - File validation and storage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AttachmentService {
    
    private final AttachmentRepository attachmentRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;
    
    /**
     * Upload attachment to a message
     * @param messageId ID of the message
     * @param file File to upload
     * @param userId ID of user uploading the file
     * @return AttachmentDTO with uploaded file metadata
     * @throws ResourceNotFoundException if message or user not found
     * @throws IOException if file upload fails
     */
    @Transactional
    public AttachmentDTO uploadAttachment(Long messageId, MultipartFile file, Long userId) 
            throws IOException, ResourceNotFoundException {
        
        log.info("Uploading attachment to message: {} by user: {}", messageId, userId);
        
        // Verify message exists
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new ResourceNotFoundException("Message not found with id: " + messageId));
        
        // Verify user exists
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Upload file
        FileUploadService.FileMetadata fileMetadata = fileUploadService.saveFile(file);
        
        // Create attachment entity
        Attachment attachment = Attachment.builder()
            .message(message)
            .fileName(fileMetadata.getFileName())
            .fileSize(fileMetadata.getFileSize())
            .fileType(fileMetadata.getFileType())
            .filePath(fileMetadata.getFilePath())
            .downloadUrl(fileMetadata.getDownloadUrl())
            .uploadedBy(user)
            .build();
        
        // Save attachment
        Attachment savedAttachment = attachmentRepository.save(attachment);
        log.info("Attachment saved with id: {}", savedAttachment.getId());
        
        // Validate file size
        savedAttachment.validateFileSize();
        
        return AttachmentDTO.fromAttachment(savedAttachment);
    }
    
    /**
     * Upload multiple attachments to a message
     * @param messageId ID of the message
     * @param files Files to upload
     * @param userId ID of user uploading files
     * @return List of AttachmentDTOs
     * @throws IOException if any file upload fails
     */
    @Transactional
    public List<AttachmentDTO> uploadAttachments(Long messageId, List<MultipartFile> files, Long userId) 
            throws IOException {
        
        log.info("Uploading {} attachments to message: {} by user: {}", 
            files.size(), messageId, userId);
        
        return files.stream()
            .map(file -> {
                try {
                    return uploadAttachment(messageId, file, userId);
                } catch (IOException e) {
                    log.error("Failed to upload attachment: {}", file.getOriginalFilename(), e);
                    throw new RuntimeException(e);
                }
            })
            .collect(Collectors.toList());
    }
    
    /**
     * Get attachment by ID
     * @param attachmentId ID of the attachment
     * @return AttachmentDTO
     * @throws ResourceNotFoundException if attachment not found
     */
    public AttachmentDTO getAttachment(Long attachmentId) throws ResourceNotFoundException {
        log.info("Fetching attachment: {}", attachmentId);
        
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
        
        return AttachmentDTO.fromAttachment(attachment);
    }
    
    /**
     * Get all attachments for a message
     * @param messageId ID of the message
     * @return List of AttachmentDTOs
     */
    public List<AttachmentDTO> getAttachmentsByMessage(Long messageId) {
        log.info("Fetching attachments for message: {}", messageId);
        
        return attachmentRepository.findByMessageId(messageId).stream()
            .map(AttachmentDTO::fromAttachment)
            .collect(Collectors.toList());
    }
    
    /**
     * Get file bytes for download
     * @param attachmentId ID of the attachment
     * @return File bytes
     * @throws IOException if file read fails
     * @throws ResourceNotFoundException if attachment not found
     */
    public byte[] downloadAttachment(Long attachmentId) throws IOException, ResourceNotFoundException {
        log.info("Downloading attachment: {}", attachmentId);
        
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
        
        return fileUploadService.getFile(attachment.getFilePath());
    }
    
    /**
     * Delete attachment by ID
     * @param attachmentId ID of the attachment
     * @param userId ID of user requesting deletion (for ownership check)
     * @throws ResourceNotFoundException if attachment not found
     */
    @Transactional
    public void deleteAttachment(Long attachmentId, Long userId) throws ResourceNotFoundException {
        log.info("Deleting attachment: {} by user: {}", attachmentId, userId);
        
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Attachment not found with id: " + attachmentId));
        
        // Verify ownership (user is the uploader or message sender)
        if (!attachment.getUploadedBy().getId().equals(userId) && 
            !attachment.getMessage().getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot delete this attachment");
        }
        
        // Delete file from disk
        fileUploadService.deleteFile(attachment.getFilePath());
        
        // Delete from database
        attachmentRepository.delete(attachment);
        log.info("Attachment deleted successfully");
    }
    
    /**
     * Get total file size for a user (for quota checking)
     * @param userId ID of the user
     * @return Total file size in bytes
     */
    public Long getUserAttachmentSize(Long userId) {
        return attachmentRepository.getTotalFileSizeForUser(userId);
    }
}
