package com.my_app.schoolboard;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.beans.factory.annotation.Autowired;
import com.my_app.schoolboard.service.UserSearchService;
import org.springframework.data.domain.Page;
import com.my_app.schoolboard.dto.UserSearchResultDTO;

@SpringBootTest
@ActiveProfiles("test")
class SchoolBoardApplicationTests {

    @Autowired
    private UserSearchService userSearchService;

    @Test
    void contextLoads() {
        try {
            Page<UserSearchResultDTO> result = userSearchService.searchUsers("top", 0, 10);
            System.out.println("TEST SUCCESS: " + result.getTotalElements());
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

}
