package com.my_app.schoolboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Profile data for institute accounts in account responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstituteProfileDTO {

    private String institutionName;
    private String institutionType;
    private String registrationNumber;
    private String province;
    private String district;
    private String address;
    private String contactPerson;
    private String contactNumber;
    private String website;
    private Boolean verified;
}
