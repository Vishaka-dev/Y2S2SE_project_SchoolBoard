package com.my_app.schoolboard.dto;

import com.my_app.schoolboard.model.ReactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReactionRequestDTO {
    private ReactionType reactionType;
}
