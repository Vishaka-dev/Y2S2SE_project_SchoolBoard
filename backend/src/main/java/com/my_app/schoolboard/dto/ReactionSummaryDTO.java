package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionSummaryDTO {
    private Map<ReactionType, Long> reactionCounts;
    private Long totalReactions;
    private ReactionType currentUserReaction;
}
