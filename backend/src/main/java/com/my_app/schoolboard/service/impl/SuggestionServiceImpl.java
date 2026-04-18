package com.my_app.schoolboard.service.impl;

import com.my_app.schoolboard.dto.SuggestionPageDTO;
import com.my_app.schoolboard.dto.SuggestionUserDTO;
import com.my_app.schoolboard.exception.ResourceNotFoundException;
import com.my_app.schoolboard.model.InstituteProfile;
import com.my_app.schoolboard.model.Role;
import com.my_app.schoolboard.model.StudentProfile;
import com.my_app.schoolboard.model.TeacherProfile;
import com.my_app.schoolboard.model.User;
import com.my_app.schoolboard.repository.InstituteProfileRepository;
import com.my_app.schoolboard.repository.StudentProfileRepository;
import com.my_app.schoolboard.repository.TeacherProfileRepository;
import com.my_app.schoolboard.repository.UserRepository;
import com.my_app.schoolboard.service.SuggestionService;
import com.my_app.schoolboard.service.suggestion.SuggestionStrategy;
import com.my_app.schoolboard.service.suggestion.SuggestionUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SuggestionServiceImpl implements SuggestionService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final InstituteProfileRepository instituteProfileRepository;
    private final List<SuggestionStrategy> suggestionStrategies;

    @Override
    @Cacheable(cacheNames = "userSuggestions", key = "#username + ':' + #page + ':' + #size")
    public SuggestionPageDTO getSuggestions(String username, int page, int size) {
        User currentUser = userRepository.findActiveByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 5), 10);

        Pageable pageable = PageRequest.of(normalizedPage, normalizedSize);
        Page<User> candidates = userRepository.findSuggestionCandidates(currentUser.getId(), pageable);

        List<Long> lookupUserIds = extractLookupIds(candidates.getContent(), currentUser.getId());

        Map<Long, StudentProfile> studentByUserId = mapStudentsByUserId(lookupUserIds);
        Map<Long, TeacherProfile> teacherByUserId = mapTeachersByUserId(lookupUserIds);
        Map<Long, InstituteProfile> instituteByUserId = mapInstitutesByUserId(lookupUserIds);

        SuggestionUserContext currentContext = buildContext(currentUser, studentByUserId, teacherByUserId,
                instituteByUserId);

        List<SuggestionUserDTO> suggestionDtos = candidates.getContent().stream()
                .map(candidate -> toSuggestionDto(candidate, currentContext, studentByUserId, teacherByUserId,
                        instituteByUserId))
                .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))
                .toList();

        return SuggestionPageDTO.builder()
                .suggestions(suggestionDtos)
                .page(candidates.getNumber())
                .size(candidates.getSize())
                .totalElements(candidates.getTotalElements())
                .totalPages(candidates.getTotalPages())
                .hasNext(candidates.hasNext())
                .build();
    }

    private SuggestionUserDTO toSuggestionDto(
            User candidate,
            SuggestionUserContext currentContext,
            Map<Long, StudentProfile> studentByUserId,
            Map<Long, TeacherProfile> teacherByUserId,
            Map<Long, InstituteProfile> instituteByUserId) {

        SuggestionUserContext candidateContext = buildContext(candidate, studentByUserId, teacherByUserId,
                instituteByUserId);

        Map<String, Integer> componentScores = suggestionStrategies.stream()
                .collect(Collectors.toMap(
                        SuggestionStrategy::componentName,
                        strategy -> strategy.score(currentContext, candidateContext)));

        int totalScore = componentScores.values().stream().mapToInt(Integer::intValue).sum();

        return SuggestionUserDTO.builder()
                .id(candidate.getId())
                .username(candidate.getUsername())
                .displayName(resolveDisplayName(candidate, studentByUserId, teacherByUserId, instituteByUserId))
                .profileImageUrl(candidate.getProfileImageUrl())
                .role(candidate.getRole())
                .score(totalScore)
                .institutionScore(componentScores.getOrDefault("institution", 0))
                .sharedInterestScore(componentScores.getOrDefault("interest", 0))
                .roleScore(componentScores.getOrDefault("role", 0))
                .provinceScore(componentScores.getOrDefault("province", 0))
                .build();
    }

    private SuggestionUserContext buildContext(
            User user,
            Map<Long, StudentProfile> studentByUserId,
            Map<Long, TeacherProfile> teacherByUserId,
            Map<Long, InstituteProfile> instituteByUserId) {

        Long userId = user.getId();
        StudentProfile student = studentByUserId.get(userId);
        TeacherProfile teacher = teacherByUserId.get(userId);
        InstituteProfile institute = instituteByUserId.get(userId);

        return SuggestionUserContext.builder()
                .userId(userId)
                .role(user.getRole())
                .province(resolveProvince(student, teacher, institute))
                .institutionName(resolveInstitutionName(student, teacher, institute))
                .interests(resolveNormalizedInterests(user.getRole(), student, teacher))
                .build();
    }

    private String resolveProvince(StudentProfile student, TeacherProfile teacher, InstituteProfile institute) {
        if (student != null && !isBlank(student.getProvince())) {
            return normalize(student.getProvince());
        }
        if (teacher != null && !isBlank(teacher.getProvince())) {
            return normalize(teacher.getProvince());
        }
        if (institute != null && !isBlank(institute.getProvince())) {
            return normalize(institute.getProvince());
        }
        return null;
    }

    private String resolveInstitutionName(StudentProfile student, TeacherProfile teacher, InstituteProfile institute) {
        if (student != null) {
            if (!isBlank(student.getSchoolName())) {
                return normalize(student.getSchoolName());
            }
            if (!isBlank(student.getUniversityName())) {
                return normalize(student.getUniversityName());
            }
        }
        if (teacher != null && !isBlank(teacher.getInstitutionName())) {
            return normalize(teacher.getInstitutionName());
        }
        if (institute != null && !isBlank(institute.getInstitutionName())) {
            return normalize(institute.getInstitutionName());
        }
        return null;
    }

    private Set<String> resolveNormalizedInterests(Role role, StudentProfile student, TeacherProfile teacher) {
        if (student != null && student.getInterests() != null) {
            return student.getInterests().stream()
                    .map(this::normalize)
                    .filter(value -> !value.isBlank())
                    .collect(Collectors.toSet());
        }

        if (role == Role.TEACHER && teacher != null && !isBlank(teacher.getSubjectSpecialization())) {
            return Arrays.stream(teacher.getSubjectSpecialization().split("[,/;|\\s]+"))
                    .map(this::normalize)
                    .filter(value -> !value.isBlank())
                    .collect(Collectors.toSet());
        }

        return Collections.emptySet();
    }

    private String resolveDisplayName(
            User candidate,
            Map<Long, StudentProfile> studentByUserId,
            Map<Long, TeacherProfile> teacherByUserId,
            Map<Long, InstituteProfile> instituteByUserId) {
        StudentProfile student = studentByUserId.get(candidate.getId());
        if (student != null && !isBlank(student.getFullName())) {
            return student.getFullName();
        }

        TeacherProfile teacher = teacherByUserId.get(candidate.getId());
        if (teacher != null && !isBlank(teacher.getFullName())) {
            return teacher.getFullName();
        }

        InstituteProfile institute = instituteByUserId.get(candidate.getId());
        if (institute != null && !isBlank(institute.getInstitutionName())) {
            return institute.getInstitutionName();
        }

        return candidate.getUsername();
    }

    private List<Long> extractLookupIds(List<User> users, Long currentUserId) {
        return users.stream()
                .map(User::getId)
                .collect(Collectors.collectingAndThen(Collectors.toSet(), ids -> {
                    ids.add(currentUserId);
                    return ids.stream().toList();
                }));
    }

    private Map<Long, StudentProfile> mapStudentsByUserId(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return new HashMap<>();
        }
        return studentProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), profile -> profile));
    }

    private Map<Long, TeacherProfile> mapTeachersByUserId(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return new HashMap<>();
        }
        return teacherProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), profile -> profile));
    }

    private Map<Long, InstituteProfile> mapInstitutesByUserId(Collection<Long> userIds) {
        if (userIds.isEmpty()) {
            return new HashMap<>();
        }
        return instituteProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), profile -> profile));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
